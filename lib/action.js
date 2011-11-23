var spawn = require('child_process').spawn;

require('./colors');

exports.error = function (message) {
  console.log('Error:'.red + ' ' + message);
};

exports.printItem = function (prefix, item) {
  console.log(prefix);
  Object.keys(item).forEach(function (key) {
    console.log('|-- ' + key + ': ' + item[key]);
  });
};

exports.remote = function (host, cmd, callback) {
  var ssh = spawn('ssh', [host, cmd]);

  process.stdout.write(('\n  $ ssh ' + host + ' ' + cmd + '\n    ').blue);

  ssh.stdout.on('data', function (data) {
    process.stdout.write(('' + data).replace('\n', '\n    ').grey);
  });

  ssh.stderr.on('data', function (data) {
    process.stdout.write(('' + data).replace('\n', '\n    ').red);
  });

  ssh.on('exit', function (code) {
    callback(code);
  });

  ssh.stdin.end();
};


exports.local = function (cmd, callback) {
  cmd = cmd.split(' ');
  var pname = cmd.shift(),
    proc = spawn(pname, cmd);

  console.log(('\n  $ ' + pname + ' ' + cmd.join(' ')).blue);
  process.stdout.write('\n    ');

  proc.stdout.on('data', function (data) {
    process.stdout.write(('' + data).replace(/\n/g, '\n    ').grey);
  });

  proc.stderr.on('data', function (data) {
    process.stdout.write(('' + data).replace(/\n/g, '\n    ').red);
  });

  proc.on('exit', function (code) {
    callback(code);
  });

  proc.stdin.end();
};
