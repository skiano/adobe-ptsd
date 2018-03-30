import {
  config,
  sayHello,
  argv,
} from 'ptsd'

sayHello(argv.title || config.title)

var inputFolder = Folder.selectDialog("Select a folder to process");
