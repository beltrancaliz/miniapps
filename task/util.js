var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var execSync = require('child_process').execSync;
var ora = require('ora');
var _ = require('lodash');

module.exports = {
    ora: ora,
    pad: function (text, length, options) {
        var escapecolor, i, invert, j, pad, padlength, ref, ref1;
        if (options == null) {
            options = {};
        }
        invert = typeof text === 'number';
        if (invert) {
            ref = [text, length], length = ref[0], text = ref[1];
        }
        if (typeof options === 'string') {
            options = {
              char: options
            };
        }
        if (options.char == null) {
            options.char = ' ';
        }
        if (options.strip == null) {
            options.strip = false;
        }
        text = text.toString();
        pad = '';
        if (options.colors) {
            escapecolor = /\x1B\[(?:[0-9]{1,2}(?:;[0-9]{1,2})?)?[m|K]/g;
            length += text.length - text.replace(escapecolor, '').length;
        }
        padlength = length - text.length;
        if (padlength < 0) {
            if (options.strip) {
              if (invert) {
                return text.substr(length * -1);
              } else {
                return text.substr(0, length);
              }
            }
            return text;
        }
        for (i = j = 0, ref1 = padlength; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            pad += options.char;
        }
        if (invert) {
            return pad + text;
        } else {
            return text + pad;
        }
    },
    copySync: fs.copySync,
    removeSync: function (filesToRemove) {
        fs.removeSync(filesToRemove);
    },
    execSync: function (cmd, options) {
        options = options || {};
        options.stdio = options.stdio || [0,1,2];
        var cmdRes = execSync(cmd, options);
        return cmdRes;
    },
    getRelative: function (opath) {
        return path.relative(this.getCwd(), path.join(opath.dir, opath.base));
    },
    isAbsPath: function (p) {
        return path.isAbsolute(p);
    },
    isDir: function (p) {
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isDirectory();
    },
    isString: function (obj) {
        return toString.call(obj) === '[object String]';
    },
    getCwd: function () {
        return process.cwd();
    },
    getCliDir: function () {
        return __dirname;
    },
    writeFile: function (p, data) {
        var opath = (this.isString(p) ? path.parse(p) : p);
        if (!this.isDir(opath.dir)) {
            mkdirp.sync(opath.dir);
        }
        fs.writeFileSync(p, data);
    },
    getDistPath: function (opath, ext, src, dist) {
        var dir = '';
        ext = ext ? ext : opath.ext;
        dir = (opath.dir + path.sep).replace(path.sep + src + path.sep, path.sep + dist + path.sep);
        return dir + opath.name + ext;
    },
    isFile: function (p) {
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isFile();
    },
    getFiles: function (dir, prefix) {
        dir = dir || process.cwd();
        prefix = prefix || '';
        dir = path.normalize(dir);
        var self = this;
        if (!fs.existsSync(dir)) {
            return [];
        }
        var files = fs.readdirSync(dir);
        var rst = [];
        files.forEach(function (item) {
            var filepath = dir + path.sep + item;
            var stat = fs.statSync(filepath);
            if (stat.isFile()) {
                rst.push(prefix + item);
            } else if(stat.isDirectory()){
                rst = rst.concat(self.getFiles(path.normalize(dir + path.sep + item),  path.normalize(prefix + item + path.sep)));
            }
        });

        return rst;
    },
    readFile: function (p) {
        var rst = '';
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        try {
            rst = fs.readFileSync(p, 'utf-8');
        } catch (e) {
            rst = null;
        }
        return rst;
    },
    getProjConfig: function () {
        var config;
        var configFile = path.join(this.getCwd(), path.sep, 'miniapp.config.json');
        if (!this.isFile(configFile)) {
            return {};
        } else {
            config = require(configFile);
        }
        return config;
    },
    template: function (source, destination, data, options) {
        destination = destination || source;

        var body = this.readFile(source);
        body = this.engine(body, data, options);

        this.writeFile(destination, body);
        this.removeSync(source);
    },
    engine: function (source, data, options) {
        source = source.replace(/<%%([^%]+)%>/g, function (m, content) {
            return '(;>%%<;)' + content + '(;>%<;)';
        });

        source = _.template(source, null, options)(data);

        source = source
            .replace(/\(;>%%<;\)/g, '<%')
            .replace(/\(;>%<;\)/g, '%>');

        return source;
    }
}