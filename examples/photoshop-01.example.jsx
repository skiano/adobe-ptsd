(function () {
  'use strict';

  var configuration = {"title":"defaultScript"}

  var passedArgs = {"preset":"examples/photoshop-01.example.jsx","script":"examples/photoshop-01.js","app":"photoshop"}

  /**
   * `configuration` and `passedArgs`
   * are injected into the bundle via a rollup plugin
   */

  /**
   * `configuration` and `argv`
   * are exposed so that user scripts can
   * use custom configuration or arguments
   */
  var config = configuration;
  var argv = passedArgs;

  /**
   * useful scripts may be exported here
   * so that users can take advantage of them
   */

  alert(("hello " + (argv.title || config.title)));

  var inputFolder = Folder.selectDialog("Select a folder to process");

}());
