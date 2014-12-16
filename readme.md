Nock-exec is a [`child_process.exec`](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) mocking library for Node.js

# Usage
In your test you can write:
```js
var nockExec = require('nock-exec');
nockExec('myapp').err('some error').reply(0, 'This command was mocked');
```

This means that any call in the form
```js
var exec = require('child_process').exec;
exec('myapp', function(error, stdout, stderr) {
   console.log('stdout: ' + stdout);
   console.log('stderr: ' + stderr);
   if (error !== null) {
     console.log('exec error: ' + error);
   }
});
```
will produce this output:
```
stdout: This command was mocked
stderr: some error
```

# To do
## arguments
Manage conditional arguments like
```js
var nockExec = require('nock-exec');
nockExec('myapp').args('a b c').reply(0, 'done');
```

## delay
```js
var nockExec = require('nock-exec');
nockExec('myapp').args('a b c').delay(300).reply(0, 'done');
```

## filtering
```js
var nockExec = require('nock-exec');
nockExec('myapp')
    .filteringArgs(function(args) {
       return 'a b c';
    })
    .reply(0, 'done');
```
