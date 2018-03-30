import {
  config,
  sayHello,
  argv,
} from 'ptsd'


function main () {
  sayHello(argv.title || config.title)
}

main();
