var path = require('path');
var util = require('./util');
var cStyle = require('./compile-style');
var cScript = require('./compile-script');
var fs = require('fs-extra');
var gaze = require('gaze');
var config = require('./config').getConfig();
var ora = util.ora;

module.exports = {
    _hasWatched: false,
    build: function(file) {
        var self = this;
        var src = config.src;
        var dist = config.dist;
        var watch = config.watch;
        var current = util.getCwd();
        var files = file ? [file] : util.getFiles(src);
        var filesLen = files.length;

        if (!file) {
            fs.removeSync(dist)
        }

        var buildSpinner = ora('building');
        buildSpinner.start();

        files.forEach(function traverseFile(f) {
            if (!util.isAbsPath(f)) {
                f = path.join(current, src, f);
            }
            var opath = path.parse(f);

            self.compile(opath);

            filesLen--;

            if (!filesLen) {
                buildSpinner.stop();
            }
        });

        if (watch && !self._hasWatched) {
            self._watch();
        }
    },
    compile: function(opath) {
        var src = config.src;
        var dist = config.dist;

        if (!util.isFile(opath)) {
            console.error('文件不存在：' + util.getRelative(opath));
            return;
        }

        switch (opath.ext) {
            case '.sass':
            case '.scss':
                cStyle.compile('sass', opath);
                break;
            case '.styl':
                cStyle.compile('stylus', opath);
                break;
            case '.js':
                cScript.compile(opath);
                break;
            default:
                var distDirPath = util.getDistPath(opath, '', src, dist);
                var srcDirPath = path.join(opath.dir, opath.base);

                fs.copy(srcDirPath, distDirPath, function(err) {
                    if (err) return console.error(err)
                })
                break
        }
    },
    _watch: function() {
        var self = this;
        var src = config.src;

        self._hasWatched = true;

        console.log('watching files to compile...');

        gaze([src + '/**/*'], function() {
            this.on('added', wrapper('added'));

            this.on('renamed', wrapper('renamed'));

            this.on('changed', wrapper('changed'));

            this.on('deleted', del);


            function wrapper (eventType) {
                return function (filepath) {
                    console.log(filepath + ' was ' + eventType);
                    self.build(filepath);
                }
            }

            function del (filepath) {
                var opath = filepath;
                var suffixMap = {
                    '.sass': '.wxss',
                    '.stylus': '.wxss'
                }
                var filepathObj = path.parse(filepath);
                var ext = filepathObj.ext;
                var suffix = suffixMap[ext];
                filepath = filepath.replace(config.src, config.dist);

                if (suffix) {
                    filepath = filepath.replace(ext, suffix);
                }

                fs.removeSync(filepath);
                console.log(opath + ' was ' + 'deleted');
            }
        });
    }
}
