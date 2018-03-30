import configuration from 'ptsd/config'
import passedArgs from 'ptsd/args'

export const config = configuration
export const argv = passedArgs

export const sayHello = (txt) => {
  alert(`hello ${txt}`)
  var inputFolder = Folder.selectDialog("Select a folder to process");
}
