#! /usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const rollup = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const buble = require('rollup-plugin-buble')
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const options = require('minimist')(process.argv.slice(2), {
  alias: {
    c: 'config',
    a: 'app',
    s: 'script',
    p: 'preset',
    h: 'help',
  },
  default: {
    execute: true,
  }
});

module.exports = async function nodobe(options) {

  /**
   * Validate options
   */
  if (typeof options.script !== 'string') {
    throw new Error('script is required')
  }

  if (typeof options.app !== 'string') {
    throw new Error('app is required')
  }

  /**
   * Sort out where all the files are
   */
  const applicationsPath = '/Applications'
  const tempDirectory = path.resolve(__dirname, '..', 'temp')
  const tempJsxDest = path.resolve(tempDirectory, 'src.temp.jsx')
  const tempScriptDest = path.resolve(tempDirectory, 'src.temp.scpt')
  const scriptPath = require.resolve(path.resolve(process.cwd(), options.script))
  const sourcePath = require.resolve(path.resolve(__dirname, './public'))
  const configPath = options.config
    ? require.resolve(path.resolve(process.cwd(), options.config))
    : require.resolve(path.resolve(__dirname, 'defaultConfig'))


  /**
   * Load the configuration for the script
   */
  let config
  try {
    config = require(configPath)
  } catch (e) {
    throw new Error(`Error loading configuration: ${configPath}`)
  }

  /**
   * Create the rollup plugin to expose nodobe to script
   */
  const nodobePlugin = () => {
    return {
      load(id) {
        if (id === 'nodobe/args') return `export default ${JSON.stringify(options)}`
        if (id === configPath) return `export default ${JSON.stringify(config)}`
      },
      resolveId(importee, importer) {
        if (!importer) return null; // disregard entry module
        if (importee === 'nodobe') return sourcePath
        if (importee === 'nodobe/config') return configPath
        if (importee === 'nodobe/args') return 'nodobe/args'
      },
    }
  }

  /**
   * createAdobeJsx
   * makes a temporary jsx file
   * and allows the js to import from nodobe helpers
   */
  async function createAdobeJsx(dest) {
    const bundle = await rollup.rollup({
      input: scriptPath,
      plugins: [
        nodobePlugin(),
        resolve(),
        buble(),
      ],
    })

    await bundle.write({
      globals: ['nodobe/config'],
      file: dest,
      format: 'iife'
    })
  }

  /**
   * locate the relevant adobe application
   * in a forgiving way so people don't need to know
   * the exact software version
   */
  async function locateAdobeApplication() {
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

    return matchingApps[0]
  }

  /**
   * createAppleScript
   * makes a temporary apple script which
   * tells the adobe software to run the jsx
   * @see: https://stackoverflow.com/a/9029394
   */
  async function createAppleScript(app) {
    await fs.writeFile(tempScriptDest, [
      `tell application "${app}"`,
      `\t do javascript "#include ${tempJsxDest}"`,
      'end tell',
    ].join('\n'))
  }

  /**
   * create a static preset
   */
  async function createPreset(preset) {
    const app = await locateAdobeApplication()

    let presetPath
    let presetFolder
    let presetFile

    if (typeof preset === 'string') {
      if (path.extname(options.preset) !== '.jsx') throw new Error('script must be a .jsx file')
      presetFolder = process.cwd()
      presetFile = path.resolve(presetFolder, options.preset)
    } else {
      presetPath = path.resolve(applicationsPath, app, 'Presets', 'Scripts')
      presetFolder = path.resolve(presetPath, 'nodobe')
      presetFile = path.resolve(presetFolder, path.basename(scriptPath).replace('.js', '.jsx'))
      if (!fs.pathExistsSync(presetPath)) {
        throw new Error(`could not find preset folder at ${presetPath}`)
      }
    }

    try {
      await fs.ensureDir(presetFolder)
      await createAdobeJsx(presetFile)
      return `created preset ${chalk.cyan(presetFile)}`
    } catch (e) {
      if (e.message.includes('EACCES')) {
        console.log(`\nCould not write preset to ${chalk.cyan(presetFile)}\nEither change permissions on the presets folder use \`sudo\`\n`)
      } else {
        throw e
      }
    }
  }

  /**
   * execute the script immediately
   */
  async function executeScript() {
    const app = await locateAdobeApplication()
    await fs.ensureDir(tempDirectory)

    await Promise.all([
      createAdobeJsx(tempJsxDest),
      createAppleScript(app),
    ])

    await exec(`osascript ${tempScriptDest}`)

    await fs.remove(tempDirectory)

    return `executed successfully`
  }

  /**
   * Run!
   */
  if (options.preset) {
    return await createPreset(options.preset)
  } else {
    return await executeScript()
  }
}
