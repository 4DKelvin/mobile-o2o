var fs = require('fs'),
    map = function (array) {
        var rs = [];
        array.forEach(function (key) {
            var t = rs,
                dirs = key.split('/');
            dirs.forEach(function (dir, index) {
                if (index == dirs.length - 1) {
                    t[dir] = key;
                } else {
                    if (!t[dir]) {
                        t[dir] = {};
                    }
                    t = t[dir];
                }
            });
        });
        return rs;
    },
    walk = function (dir) {
        return new Promise(function (resolve, reject) {
            var results = [];
            fs.readdir(dir, function (err, list) {
                if (err) return reject(err);
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return resolve(results);
                    file = dir + '/' + file;
                    fs.stat(file, function (err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file).then(function (res) {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        });
    };
module.exports = function (dir) {
    return new Promise(function (resolve, reject) {
        walk(dir).then(function (results) {
            resolve(map(results));
        })
    });
};