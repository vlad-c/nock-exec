var cp = require('child_process');
var os = require('os');

var dir = os.tmpdir();
var cmdLine = 'dir ' + dir;

function start() {
    command = cp.exec(cmdLine);
    command.stdin.end();

    command.stdout.on('data', function (data) {
        console.log('got listing data:' + data);
    });

    command.on('error', function (err) {
        console.log('ERROR: Listing ' + dir);
        console.log(err);
    });

    command.on('exit', function (code) {
        console.log('-- done listing ' + dir + ' / exit=' + code);
    });
}

function startWithCallback() {
    command = cp.exec(cmdLine, function(error, stdout, stderr) {
        console.log('Listing ' + dir);
        console.log(stdout);
        console.log(stderr);
        if (error) {
            console.error('ERROR:' + error);
        }
        console.log('-- done listing ' + dir);
    });
}

exports.start = start;
exports.startWithCallback = startWithCallback;
exports.cmdLine = cmdLine;
