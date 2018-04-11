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

### Usage

```bash
$ nodobe --app photoshop --script my-file.js
```

--------

### Running examples in development

If you want to contribute, you will need to be able to run the examples

```bash
$ git clone https://github.com/skiano/nodobe.git # clone the source
$ cd nodobe  # navigate to project
$ npm start photoshop-01 # or any other example in examples/
```
