# launch – app deployment for node.js

launch is an application deployment framework, essentially a lean set
of [jake](https://github.com/mde/jake) tasks for deploying node apps.

Currently it is tiny, but very extensible.

## Installation

launch is for use on projects that have a `package.json` file in the root
to manage their dependencies.

Add launch as a devDependency to your `package.json`, eg:

```js
"devDependencies" : {
  "launch" : ">=0"
}
```

And then do
  
    cd /path/to/project && npm install

Since launch is built on top of jake, you will need that too. It's best
to install jake globally, so that the binary is in your path, so:

    npm install jake -g

The last thing to do is create a `Jakefile` in your project root. For now,
just put the following:

```js
var share = {},
  action = require('launch')(share).action;
```

To test that launch and jake are installed correctly, do:
  
    jake -T

This should output a list the of namespaced launch tasks.

## Usage

**You should be familiar with jake**

The default set of tasks require a little bit of project metadata. In your
`package.json`, put the following info:

```js
"launchconf" : {
  "remote" : "host-name",
  "remotepath" : "/path/to/apps"
}
```

Run `jake launch:info` to make sure you've got this right.

Now you're ready to create some of your own tasks for deployment. Here is an
example `Jakefile` that I currently use:

```js
var share = {}, // Shared info between the
                // Jakefile tasks and the launch tasks
  action = require('launch')(share).action; // Get the launch actions,
                                            // passing in the shared var


/*
 * Run with `jake deploylive`. Depends on `setenvlive` and `restart`
 * which are defined in this file, and `launch:installdeps` which is
 * provided by launch. The task itself is empty, the important things
 * are its dependencies being called in order.
 */
desc('Deploy the current branch to the live environment');
task('deploylive', ['setenvlive', 'launch:installdeps', 'restart'], function () {
});

/*
 * Sets the optional enviroment on the shared object
 * to `live`, which is used by a launch task when operating
 * with the remote filesystem. This task depends on the
 * launch task `launch:info` to gather the remote info.
 */
desc('Sets the environment to live');
task('setenvlive', ['launch:info'], function () {
  share.env = 'live';
});


/*
 * A custom task of mine to restart the the site/app
 * (I use upstart). This shows how to execute an arbitrary
 * remote command with launch's `action`s.
 */
desc('Restarts the server given an `env`');
task('restart', function () {

  if (!share.env) {
    action.error('`env` is not set.');
    fail();
  }

  action.remote(share.info.remote,
    'sudo stop site.' + share.info.name + '-' + share.env + ' && '
    + 'sudo start site.' + share.info.name + '-' + share.env, function (exitcode) {
      if (exitcode === 0) {
        action.notice('The site service restarted.');
        action.notice('Check manually to verify that the site is running.')
      } else {
        action.error('Failed to restart site');
        fail();
      }
    });

}, true);
```

That's it! Enjoy. Oh and here's the obligatory screenshot:

![launch running](http://f.cl.ly/items/3K020K3K2C1v333e1q2S/Screen%20Shot%202011-12-09%20at%2023.34.58.png)


## License

(The MIT License)

Copyright (c) 2011 Ben Gourley &lt;benleighgourley@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
