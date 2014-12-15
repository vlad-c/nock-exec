// In order to manage code like:
//    var exec = require('child_process').exec;
// need to check around
//    var proxyquire =  require('proxyquire');

var cp = require('child_process');
var Stream = require('stream');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var os = require('os');

util.inherits(DirectDuplex, Stream.Duplex);
function DirectDuplex(options) {
    if (!(this instanceof DirectDuplex))
        return new DirectDuplex(options);
    Stream.Duplex.call(this, options);
    this._buf = new Buffer('');
    this._cache = new Buffer('');
}

DirectDuplex.prototype._read = function(size) {
    var s = this._buf.toString();
    this._buf = new Buffer('');
    return s;
};

DirectDuplex.prototype.cache = function() {
    return this._cache.toString();
};

DirectDuplex.prototype._write = function(chunk, encoding, callback) {
    var buffer = (Buffer.isBuffer(chunk)) ? chunk :  new Buffer(chunk, encoding);
    this._buf = Buffer.concat([this._buf, buffer]);
    this._cache = Buffer.concat([this._cache, buffer]);
    if (typeof callback === 'function') {
        callback();
    }
    this.emit('data', chunk.toString());
};

util.inherits(ProcessMock, EventEmitter);
function ProcessMock(command) {
    if (!(this instanceof ProcessMock))
        return new ProcessMock(command);
    EventEmitter.call(this);
    this._command = command;
    this._actions = [];
    this._exited = false;
    this._callback = undefined;
    this.stdout = new DirectDuplex();
    this.stderr = new DirectDuplex();
    this.stdin = new DirectDuplex();
}

ProcessMock.prototype._run = function(options, callback) {
    var self = this;
    this._callback = callback;
    process.nextTick(function() {
        self._exited = false;
        this._actions.forEach(function (action) {
            if (self._exited) {
                throw new Error('Command ' + self._command + ' has already exited');
            }
            switch (action.op) {
                case 'out':
                    if (typeof action.arg === 'function') {
                        action.arg(self.stdout);
                    }
                    else if (typeof action.arg === 'string') {
                        self.stdout.write(action.arg);
                    }
                    break;
                case 'err':
                    if (typeof action.arg === 'function') {
                        action.arg(self.stderr);
                    }
                    else if (typeof action.arg === 'string') {
                        self.stderr.write(action.arg);
                    }
                    break;
                case 'exit':
                    self._exited = true;
                    self.emit('exit', action.arg);
                    break;
            }
        });
        if (typeof callback === 'function') {
            var out = self.stdout.cache();
            var err = self.stderr.cache();
            callback(null, out, err);
        }
    }.bind(this));
    return this;
};

ProcessMock.prototype.reply = function(exitCode, output) {
    this._actions.push({op: 'out', arg: output});
    this._actions.push({op: 'exit', arg: exitCode});
    return this;
};

ProcessMock.prototype.out = function(output) {
    this._actions.push({op: 'out', arg: output});
    return this;
};

ProcessMock.prototype.outputLine = function(output) {
    this._actions.push({op: 'out', arg: output + os.EOL});
    return this;
};

ProcessMock.prototype.err = function(output) {
    this._actions.push({op: 'err', arg: output});
    return this;
};

ProcessMock.prototype.errorLine = function(output) {
    this._actions.push({op: 'err', arg: output + os.EOL});
    return this;
};

ProcessMock.prototype.exit = function(code) {
    this._actions.push({op: 'exit', arg: code});
    return this;
};

var interceptors = {};
var exec = null;

function overrideExec(command /*, options, callback*/) {
    var options, callback;
    if (typeof arguments[1] === 'function') {
        options = undefined;
        callback = arguments[1];
    } else {
        options = arguments[1];
        callback = arguments[2];
    }

    if (command in interceptors) {
        var interceptor = interceptors[command];
        return interceptor._run(options, callback);
    }
    else {
        if (exec === null) {
            throw new Error('Cannot override exec before module initialization')
        }
        return exec(command, options, callback);
    }
}

function start() {
    if (exec !== null) {
        return;
    }
    exec = cp.exec;
    cp.exec = overrideExec;
}

function record(command) {
    interceptors[command] = new ProcessMock(command);
    return interceptors[command];
}

start();

var childProcessStub = {
    exec: function(command /*, options, callback*/) {
        return overrideExec.apply(this, arguments);
    }
};

module.exports = record;

/**
 * Usage:
 * var proxyquire =  require('proxyquire');
 * var nockExec =  require('nock-exec');
 * var myModuleUnderTest = proxyquire('my-module-under-test', {'child_process': nockExec.moduleStub});
 * @type {{exec: Function}}
 */
module.exports.moduleStub = childProcessStub;
