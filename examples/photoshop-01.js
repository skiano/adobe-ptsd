import {
  config,
  argv,
} from 'ptsd'

alert(`hello ${argv.title || config.title}`)

var inputFolder = Folder.selectDialog("Select a folder to process");
