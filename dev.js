const fs = require('fs-extra')
const path = require('path')
const chokidar = require('chokidar')

const nodobe = require('./src')
const examplesDir = path.resolve(__dirname, 'examples')
const allScripts = fs.readdirSync(examplesDir).filter(f => path.extname(f) === '.js')

const options = require('minimist')(process.argv.slice(2), {
  alias: {
    w: 'watch',
  },
  default: {
    watch: false,
  }
});

async function createExample(file) {
  try {
    const options = {
      preset: `examples/${file.replace('.js','')}.example.jsx`,
      script: path.join('examples', file),
      app: file.split('-')[0],
    }

    const message = await nodobe(options)
    console.log(message)
  } catch (e) {
    console.error(e)
  }
}

async function createExamples(fileList) {
  await Promise.all(
    fileList.map(createExample)
  )
}

if (options.watch) {
  /**
   * Start by creating all examples
   */
  createExamples(allScripts)

  const validTypes = /(js|json)$/

  chokidar.watch('./(bin|examples|src)/**/*', {
    ignored: /\.jsx$/,
    ignoreInitial: true,
  }).on('all', (event, file) => {
    if (!validTypes.test(path.extname(file))) return

    const relativePath = path.relative(examplesDir, file)

    if (relativePath.startsWith('../')) {
      /**
       * if this is not a specific example,
       * it can potentially affect all examples
       */
      createExamples(allScripts)
    } else {
      /**
       * otherwise,
       * we can update the specific example
       */
      if (event === 'add') {
        allScripts.push(relativePath)
        createExamples([relativePath])
      } else if (event === 'unlink') {
        allScripts.splice(allScripts.indexOf(relativePath), 1)
      } else {
        createExamples([relativePath])
      }
    }
  })
} else {
  createExamples(allScripts)
}
