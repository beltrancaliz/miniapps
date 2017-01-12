var path = require('path');
var fs = require('fs');
var cachePath = '.miniappcache';
var hash = require('hash-sum');
var util = require('./util');
var config = require('./config').getConfig();

function sassCompiler(content, config, file, cb) {
    config.data = content;
    config.file = file;
    //chang strategy to use user's node-sass
    var userSassPath = require(process.cwd() + '/node_modules/node-sass');
    userSassPath.render(config, function(err, res) {
        if (err) {
            console.error(err);
        } else {
            if (cb) {
                var css = res.css;
                if (typeof css === 'object') {
                    css = css.toString();
                }
                cb(css);
            }
        }
    });
}

function stylusCompiler(content, config, file, cb) {
    config.filename = file;
    //chang strategy to use user's node-sass
    var userSassPath = require(process.cwd() + '/node_modules/stylus');
    userSassPath.render(content, config, function(err, css) {
        if (err) {
            console.error(err);
        } else {
            cb && cb(css);
        }
    });
}

module.exports = {
    compile: function(lang, opath) {
        var src = config.src;
        var dist = config.dist;
        var content = util.readFile(path.join(opath.dir, opath.base));
        var filename = opath.base;
        var target = util.getDistPath(opath, '.wxss', src, dist);

        var cache;
        if (util.isFile(cachePath)) {
            cache = JSON.parse(util.readFile(cachePath));
        } else {
            cache = Object.create(null);
        }
        var cacheKey = hash(filename + content);
        var output = cache[cacheKey];
        if (output) {
            util.writeFile(target, output);
            return;
        }

        if (lang === 'sass') {
            sassCompiler(content, {}, path.join(opath.dir, opath.base), function cb(css) {
                util.writeFile(target, css);
                cache[cacheKey] = css;
                util.writeFile(cachePath, JSON.stringify(cache));
            });
        } else if (lang === 'stylus') {
            stylusCompiler(content, {}, path.join(opath.dir, opath.base), function cb(css) {
                util.writeFile(target, css);
                cache[cacheKey] = css;
                util.writeFile(cachePath, JSON.stringify(cache));
            });

        }
    }
}
