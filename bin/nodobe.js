#! /usr/bin/env node
const nodobe = require('../src')
const chalk = require('chalk')

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

if (options.help) {
  console.log(`\n${fs.readFileSync(require.resolve('./help.txt')).toString().trim()}\n`)
} else {
  nodobe(options).catch(err => {
    console.error(chalk.red(err.toString()))
  }).then(message => {
    console.log(message)
  })
}
