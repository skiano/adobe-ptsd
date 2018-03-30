#! /usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const buble = require('rollup-plugin-buble')
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const options = require('minimist')(process.argv.slice(2), {
  alias: {
    c: 'config',
    a: 'app',
    s: 'script',
    e: 'execute',
    w: 'watch',
  },
  default: {
    config: 'ptsd.config.json',
    execute: false,
    watch: false,
  }
});

if (typeof options.script !== 'string') {
  throw new Error('script is required')
}

const applicationsPath = '/Applications'
const configPath = require.resolve(path.resolve(process.cwd(), options.config))
const scriptPath = require.resolve(path.resolve(process.cwd(), options.script))
const sourcePath = require.resolve(path.resolve(__dirname, '..', 'src'))
const tempDirectory = path.resolve(__dirname, '..', 'temp')
const tempJsxDest = path.resolve(tempDirectory, 'src.temp.jsx')
const tempScriptDest = path.resolve(tempDirectory, 'src.temp.scpt')

const ptsdPlugin = (config) => {
  try {
    config = config || require(configPath)
  } catch (e) {
    throw new Error(`Error loading configuration: ${configPath}`)
  }

  return {
    load(id) {
      if (id === configPath) return `export default ${JSON.stringify(config)}`
    },
    resolveId(importee, importer) {
      if ( !importer ) return null; // disregard entry module
      if (importee === 'ptsd') return sourcePath
      if (importee === 'ptsd/config') return configPath
    },
  }
}

/**
 * createAdobeJsx
 * makes a temporary jsx file
 * and allows the js to import from ptsd helpers
 */
async function createAdobeJsx() {
  const bundle = await rollup.rollup({
    input: scriptPath,
    plugins: [
      ptsdPlugin(),
      resolve(),
      buble(),
    ],
  })

  await bundle.write({
    globals: ['ptsd/config'],
    file: tempJsxDest,
    format: 'iife'
  })
}

/**
 * createAppleScript
 * makes a temporary apple script which
 * tells the adobe software to run the jsx
 */
async function createAppleScript() {
  const isAdobeLike = /^Adobe.*/
  const targetApp = new RegExp(options.app, 'i')

  const apps = await fs.readdir(applicationsPath)
  const adobeApps = apps.filter(f => isAdobeLike.test(f))
  const matchingApps = adobeApps.filter(f => targetApp.test(f))

  if (matchingApps.length > 1) {
    throw new Error(
      `Found more than one app\n\t - ${matchingApps.join('\n\t - ')}\n` +
      `Please make \`app\` argument more specific`
    )
  }

  // @see: https://stackoverflow.com/a/9029394
  await fs.writeFile(tempScriptDest, [
    `tell application "${matchingApps[0]}"`,
    `\t do javascript "#include ${tempJsxDest}"`,
    'end tell',
  ].join('\n'))
}

async function executeScript() {
  try {
    await fs.ensureDir(tempDirectory)

    await Promise.all([
      createAdobeJsx(),
      createAppleScript(),
    ])

    await exec(`osascript ${tempScriptDest}`)

    await fs.remove(tempDirectory)
  }
  catch (err) {
    console.error(err)
  }
}

executeScript()
