#! /usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const options = require('minimist')(process.argv.slice(2), {
  alias: {
    c: 'config',
  },
  default: {
    config: 'ptsd.config.json',
  }
});

const configPath = path.resolve(process.cwd(), options.config)
const scriptSrc = require.resolve(path.resolve(__dirname, '..', 'src'))
const tempJsxDest = path.resolve(__dirname, 'src.temp.jsx')
const tempScriptDest = path.resolve(__dirname, 'src.temp.scpt')

const createConfiguration = () => {
  try {
    const config = Object.assign({
      application: 'Photoshop'
    }, require(path.resolve(process.cwd(), options.config)))

    // TODO: validate and fill out options
    // ie turn photoshop into Adobe Photoshop CC 2018
    // path to applications /Applications/**

    return config
  } catch (e) {
    throw new Error(`Error loading configuration: ${configPath}\n\n${e.toString()}`)
  }
}

const createAppleScript = (config) => {
  // @see: https://stackoverflow.com/a/9029394
  const content = [
    'tell application "Adobe Photoshop CC 2018"',
    `\t do javascript "#include ${tempJsxDest}"`,
    'end tell',
  ].join('\n')

  return fs.writeFile(tempScriptDest, content)
}

const createAdobeJsx = async (config) => {
  const bundle = await rollup.rollup({
    input: scriptSrc,
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
    ],
  })

  await bundle.write({
    file: tempJsxDest,
    format: 'iife'
  })
}

const cleanup = async () => {
  await Promise.all([
    fs.unlink(tempJsxDest),
    fs.unlink(tempScriptDest),
  ])
}

async function executeScript() {
  const config = createConfiguration()

  await Promise.all([
    createAdobeJsx(config),
    createAppleScript(config),
  ])

  await exec(`osascript ${tempScriptDest}`)

  await cleanup()
}

executeScript().catch((err) => {
  console.error(err.toString())
  return cleanup()
})
