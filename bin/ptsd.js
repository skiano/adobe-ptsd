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

// TODO: validate and fill out options
// ie turn photoshop into Adobe Photoshop CC 2018
// path to applications /Applications/**

const scriptSrc = require.resolve(path.resolve(__dirname, '..', 'src'))

const configPath = path.resolve(process.cwd(), options.config)
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
    input: scriptSrc,
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
  // @see: https://stackoverflow.com/a/9029394
  await fs.writeFile(tempScriptDest, [
    'tell application "Adobe Photoshop CC 2018"',
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
