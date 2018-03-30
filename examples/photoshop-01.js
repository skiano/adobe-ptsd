import {
  config,
  sayHello,
  argv,
} from 'ptsd'

sayHello(argv.title || config.title)
