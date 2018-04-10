const fs = require('fs-extra')
const path = require('path')
const chalk = require(`chalk`)
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const nodobeScript = require.resolve('../bin/nodobe')

const files = fs.readdirSync(__dirname)
  .filter(f => path.extname(f) === '.js' && f !== path.basename(__filename))

const argv = require('minimist')(process.argv.slice(2))
const scriptArg = argv._[0]
const script = path.basename(scriptArg.endsWith('.js') ? scriptArg : `${scriptArg}.js`)

if (!files.includes(script)) {
  throw new Error(
    `please specify one of the following examples\n\n\t- ${files.map(f => f.replace('.js','')).join('\n\t- ')}\n`
  )
}

async function executeExample() {
  try {
    console.log(`running example: ${chalk.cyan(script)}`)
    await exec(`${nodobeScript} --app ${script.split('-')[0]} --script ${path.join(__dirname, script)}`)
  }
  catch (err) {
    console.error(chalk.red(err.toString()))
  }
}

executeExample()
