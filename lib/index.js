var colors = require('./colors'),
  spawn = require('child_process').spawn,
  fs = require('fs');

function error(message) {
  console.log('Error:'.red + ' ' + message);
}

function setup(callback) {
  
  fs.readFile('./package.json', function (err, data) {
    
    if (err) {
      error('Make sure a `package.json` file exists in the root of the project');
      return;
    }

    var pkg = JSON.parse(data);

    if (!pkg.launchconf) {
      error('launch requires `launchconf` to be set in `package.json`');
      return;
    }

    if (!pkg.launchconf.remote || !pkg.launchconf.directory) {
      error('launch requires certain `launchconf` properties to be set in `package.json`');
      return;
    }

    callback({
      v : pkg.version || '?.?.?',
      remote : pkg.launchconf.remote,
      directory : pkg.launchconf.directory
    });

  });
}

function printItem(prefix, item) {
  console.log(prefix);
  Object.keys(item).forEach(function (key) {
    console.log('|-- ' + key + ': ' + item[key]);
  });
}

setup(function (launchconf) {
  
  exports.print = function () {
    printItem('Launch details:', launchconf);
  };

});
