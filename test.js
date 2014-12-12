var sample = require('./sample-command.js');

//console.log('===== Take 1 : without nock-exec');
//sample.start();

var nockExec = require('./nock-exec');

var myOutput = 'This is a different output for the command\nNothing more to see here !';

console.log('===== Take 2 : with nock-exec');
nockExec(sample.cmdLine).out('Doh').outputLine('Dah').reply(2, myOutput);
//sample.start();

console.log('===== Take 3 : with nock-exec and callback');
sample.startWithCallback();

console.log('===== Done');

