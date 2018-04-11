const fs = require('fs-extra')
const path = require('path')

const nodobe = require('./src')
const examplesDir = path.resolve(__dirname, 'examples')
const files = fs.readdirSync(examplesDir).filter(f => path.extname(f) === '.js')

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

Promise.all(
  files.map(createExample)
).then(() => {
  console.log('built all examples')
})
