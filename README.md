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
$ nodobe --app photoshop --script my-automation-script.js
```

### Node usage

```javascript
const nodobe = require('nodobe')

nodobe({
  script: 'relative/path/to/script',
  // other options
}).catch(err => console.error(err)
```

### Options

The same options are available in the node interface and the cli

* `--script, -s` __required__ relative path to your automation script
* `--app, -a` __required__ adobe application you wish to use (ie: `photoshop`)
* `--config, -c` relative path to a configuration file for your script
* `--preset, -p` path to the generated script (if true, creates the script in application’s preset folder)
* `--help` outputs help in cli

### Immediate execution vs preset generation

If you do not specify the `preset` option, your script will build and execute immediately. However, if you prefer to create a preset you can use the `preset` option. 

If the `preset` flag or option is `true`, then `nodobe` will attempt to build the script to the applications `Presets/Scripts` folder. Typically this would require `sudo` unless you have changed the permissions for that folder.

`preset` can also be set to a relative path where you want to generate the script.

### Configuration for your script

Configuration is optional, and you can use a file or extra cli arguments

If you specify the `config` option, `nodobe` will attempt to resolve it using require. The resolved object must be an object that can be JSON stringified. It will then be available to your automation script like so:

```javascript
import { config } from 'nodobe'
```

All the cli arguments are parsed by `minimist` and passed directly into your script, which means you can use them like so:

```javascript
import { argv } from 'nodobe'
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
