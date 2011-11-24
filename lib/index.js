module.exports = function (share) {
  
  var spawn = require('child_process').spawn,
    fs = require('fs'),
    action = require('./action');

  desc('Install dependencies via npm');
  task('installdeps', ['launch:symlink'], function () {

    action.remote(share.info.remote, 'cd ' + share.payload +
      ' && npm install --verbose', function (exitcode) {
      if (exitcode === 0) {
        action.success('Dependencies installed');
        complete();
      } else {
        action.error('Failed to install dependencies');
        fail();
      }

    });
  }, true);

  desc('Symlink new deployment');
  task('symlink', ['launch:linklast'], function () {

    action.remote(share.info.remote, 'ln -sv ' + share.payload
      + ' ' + share.linkpath + share.info.name, function (exitcode) {
        if (exitcode === 0) {
          action.success('New deployment linked');
          complete();
        } else {
          action.error('Failed to link new deployment');
          fail();
        }

      });
  }, true);

  desc('Create archive link to last deployment');
  task('linklast', ['launch:rmarchive'], function () {
    action.remote(share.info.remote, 'readlink ' + share.linkpath
      + share.info.name, function (exitcode, stdout) {
        if (stdout) {
          action.remote(share.info.remote, 'mv -v ' + share.linkpath + share.info.name + ' '
            + share.linkpath + share.info.name + '-previous', function (errcode) {
              if (exitcode === 0) {
                action.success('Previous deployment archived');
                complete();
              } else {
                action.error('Failed to archive previous deployment');
                fail();
              }
            });
        } else {
          action.notice('No previous deployment found');
          complete();
        }
      });
  }, true);


  desc('Remove archived deployment');
  task('rmarchive', ['launch:putremote'], function () {

    var env = share.env ? share.env + '/' : '';
    share.linkpath = share.info.remotepath + env;

    action.remote(share.info.remote, 'readlink ' + share.linkpath
      + share.info.name + '-previous', function (exitcode, stdout) {
        if (stdout) {
          action.remote(share.info.remote, 'rm -rf ' + stdout.substr(0, stdout.length - 1) +
            ' && rm ' + share.linkpath + share.info.name + '-previous', function (exitcode) {
              if (exitcode === 0) {
                action.success('Disposed of archived deployment');
                complete();
              } else {
                action.error('Unable to dispose of archived deployment');
                fail();
              }
            });
        } else {
          action.notice('No archived deployment found');
          complete();
        }

      });

  }, true);

  desc('Put contents of repository to remote server');
  task('putremote', ['launch:checkout'], function () {
    var env = share.env ? share.env + '/' : '';
    share.payload = share.info.remotepath + env + '/.payloads/'
      + share.info.name + '-' + new Date().getTime();
    action.local('rsync -arv ' + share.tempdir + ' rubble:'
      + share.payload, function (exitcode) {
        if (exitcode === 0) {
          action.success('Repo contents put to remote');
          complete();
        } else {
          action.error('Could not put repo to remote. Make sure `.payloads` directory exists');
          fail();
        }
      });
  }, true);


  desc('Checkout a copy of the repository to a temporary directory');
  task('checkout', ['launch:createtempdir'], function () {
    action.local('git checkout-index --prefix=' +
      share.tempdir + ' -a -f', function (exitcode) {
      
        if (exitcode === 0) {
          action.success('Repo checked out to a temporary directory');
          complete();
        } else {
          action.error('Could not checkout a copy of the repo');
          fail();
        }

    });
  }, true);

  desc('Creates a temporary directory');
  task('createtempdir', ['launch:removeoldtempdir'], function () {
    action.local('mkdir ' + share.tempdir, function (exitcode) {
      if (exitcode === 0) {
        action.success('New temporary directory created');
        complete();
      } else {
        action.error('Could not create temporary directory');
        fail();
      }
    });
  }, true);

  desc('Removes old temporary directories');
  task('removeoldtempdir', ['launch:info'], function () {
    share.tempdir = '/tmp/' + share.info.name + '-launch/';
    action.local('rm -rf ' + share.tempdir, function (exitcode) {
      if (exitcode === 0) {
        action.success('Old temporary directory removed');
        complete();
      } else {
        action.error('Could not remove old temporary directory');
        fail();
      }
    });
  }, true);

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

      action.success('Collected launch info');

      complete();

    });

  }, true);

};
