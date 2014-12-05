var exec = require('child_process').exec;
var q     = require('q');

exports.listChocoPackages = function() {
    var defer = q.defer(),
        command,
        packages = '',
        packageArray = [],
        tempArray = [];

    command = exec('chocolatey list -lo');
    command.stdin.end();

    command.stdout.on('data', function(data) {
      if(data.toString() == '\n') {
        packages = '';
      }
      packages += data;
    })

    command.on('error', function(err) {
        defer.reject();
    });

    command.on('exit', function(code) {
        packages = packages.trim('\r\n').split('\r\n');
        packages.forEach(function(pk) {
            tempArray = pk.split(' ');
            if(tempArray.length == 2) {
                packageArray.push({'name': tempArray[0], 'kind': 'software-chocolatey', 'version': tempArray[1]});
            }
        });
        defer.resolve(packageArray);
    });

    return defer.promise;
}