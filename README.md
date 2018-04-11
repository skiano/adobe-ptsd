# nodobe

### What

Create your Adobe .jsx scripts with rollup so you can use import/export es6 etc!

### Why

Because Adobe’s IDE for making .jsx scripts makes me sad, and I would rather use more familiar tools and conventions.

On a more practical note, sometimes I want to make the script accept arguments on a command line or from another process (such as my build) and I'm not aware of an easy way to do that without something like this.

### Drawbacks

* loosing the autocompletion of the IDE. But I think it would be awesome if adobe released official typescript definitions for all their global objects. Do they?
* Not even close to official.
* Only works on a mac.

### Installation

```bash
$ npm install nodobe -g
```

### Command Line Usage

```bash
$ nodobe --app photoshop --script my-file.js
```

### Node usage

```javascript
const nodobe = require('nodobe')

nodobe({
  script: 'relative/path/to/script',
  // other options
}).catch(err => console.error(err)
```

--------

### Development

If you want to contribute, you can build all the example scripts with

```bash
$ npm start
```

Or you can start a watcher with

```bash
$ npm run dev
```
