var proxyquire =  require('proxyquire');
var assert = require('assert');
var cp = require('child_process');
var Duplex = require('stream').Duplex;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

util.inherits(MyOut, Duplex);
function MyOut(options) {
    if (!(this instanceof MyOut))
        return new MyOut(options);
    Duplex.call(this, options);
    this._buf = ''; //new Buffer(1024);
}

MyOut.prototype._read = function(size) {
    return this._buf; //.toString();
};

MyOut.prototype._write = function(chunk, encoding, callback) {
    this._buf += chunk; //.write(chunk);
    if (typeof callback === 'function') {
        callback();
    }
};

util.inherits(MyProcess, EventEmitter);
function MyProcess(command) {
    if (!(this instanceof MyProcess))
        return new MyProcess(command);
    EventEmitter.call(this);
    var self = this;
    this._command = command;
    this.stdout = new MyOut();
    this.stdin = new MyOut();

    setTimeout(function() {
        self.stdout.end('Test 1.0');
        flow(self.stdout);
        //self.stdout.emit('data', 'Test 1.0');
        self.emit('exit', 0);
    }, 1000);

    this.stdin.on('end', function() {
        self.emit('exit', 0);
    });
}

var childProcessStub = {
    exec: function(command, options, callback) {
        //console.log('Executing "' + command + '"');
        //var p = cp.exec(command, options, callback);
        var p = new MyProcess(command);

        return p;
    }
};

var test = proxyquire('../../../lib/utils/chocolatey/chocolatey-util', {'child_process': childProcessStub});

/*
describe.only('etap-agent#chocolatey', function() {
    this.timeout(20000);
    var hook;
    beforeEach(function() {
        //hook = captureStream(process.stdout);
    });

    afterEach(function(){
        //hook.unhook();
    });

    describe('no chocolatey', function () {
        it('return an empty list', function (done) {
            test.listChocoPackages().then(function(packages) {
                //var r = hook.captured();
                //console.log(r);
                assert(Array.isArray(packages), 'packages is not an Array');
            }, function(err) {
                assert(false, 'We should not have been rejected !!');

            }).then(done, done);
        });
    });
});
*/

