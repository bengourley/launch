module.exports = function (share) {
  
  var spawn = require('child_process').spawn,
    fs = require('fs'),
    action = require('./action');

 /*
            action.local('git --work-tree="' + tmpdir + '" checkout -f', function (exitcode) {
              if (exitcode === 0) {
                //local('rsync -ar /tmp/ rubble:' + launchconf.directory + launchconf.name);
                console.log('Git work tree checkout out, then do this:');
                console.log('rsync -ar /tmp/ rubble:' + launchconf.directory + launchconf.name);
*/


  desc('Parse relevant information from `package.json`');
  task('info', function () {

    fs.readFile('./package.json', function (err, data) {
      
      if (err) {
        action.error('Make sure a `package.json` file exists in the root of the project');
        return;
      }

      var pkg = JSON.parse(data);

      if (!pkg.launchconf) {
        action.error('launch requires `launchconf` to be set in `package.json`');
        return;
      }

      if (!pkg.launchconf.remote || !pkg.launchconf.remotepath) {
        action.error('launch requires certain `launchconf` properties to be set in `package.json`');
        return;
      }

      share.info = {
        name : pkg.name,
        v : pkg.version || '?.?.?',
        remote : pkg.launchconf.remote,
        remotepath : pkg.launchconf.remotepath
      };

      complete();

    });

  }, true);

  desc('Put contents of repository to remote server');
  task('putremote', ['launch:checkout'], function () {
    action.local('rsync -arv ' + share.tempdir + ' rubble:'
      + share.info.remotepath + share.info.name, function (exitcode) {
        if (exitcode === 0) {
          jake.Task['launch:removeoldtempdir'].execute();
          complete();
        } else {
          action.error('Could not put repo to remote');
          fail();
        }
    });
  }, true);


  desc('Checkout a copy of the repository to a temporary directory');
  task('checkout', ['launch:createtempdir'], function () {
    action.local('git --work-tree=' +
      share.tempdir + ' checkout -f', function (exitcode) {
      
        if (exitcode === 0) {
          complete();
        } else {
          console.log(exitcode);
          action.error('Could not checkout a copy of the repo');
          fail();
        }

    });
  }, true);

  desc('Creates a temporary directory');
  task('createtempdir', ['launch:removeoldtempdir'], function () {
    action.local('mkdir ' + share.tempdir, function (exitcode) {
      if (exitcode === 0) {
        complete();
      } else {
        action.error('Could not create temporary directory');
        fail();
      }
    });
  }, true);

  desc('Removes old temporary directories');
  task('removeoldtempdir', ['launch:info'], function () {
    share.tempdir = '/tmp/' + share.info.name + '-launch';
    action.local('rm -rf ' + share.tempdir, function (exitcode) {
      if (exitcode === 0) {
        complete();
      } else {
        action.error('Could not remove old temporary directory');
        fail();
      }
    });
  }, true);


};
