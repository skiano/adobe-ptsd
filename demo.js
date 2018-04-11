const fs = require('fs-extra')
const path = require('path')
const chalk = require(`chalk`)

const nodobe = require('./src')
const examplesDir = path.resolve(__dirname, 'examples')
const files = fs.readdirSync(examplesDir).filter(f => path.extname(f) === '.js')

const argv = require('minimist')(process.argv.slice(2))
const scriptArg = argv._[0]
const usePreset = !!argv._[1]

const script = path.basename(scriptArg.endsWith('.js') ? scriptArg : `${scriptArg}.js`)

if (!files.includes(script)) {
  throw new Error(
    `please specify one of the following examples\n\n\t- ${files.map(f => f.replace('.js','')).join('\n\t- ')}\n`
  )
}

const options = {
  preset: usePreset && `examples/${script.replace('.js','')}.example.jsx`,
  script: path.join('examples', script),
  app: script.split('-')[0],
}

nodobe(options).catch(err => {
  console.error(err)
}).then((message) => {
  console.log(message)
})
