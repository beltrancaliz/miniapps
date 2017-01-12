require('shelljs/global');
var util = require('../util');
var ora = util.ora;
var path = require('path');
var config = require('../config');
var emitter = require('../event');
var glob = require('glob');
var fs = require('fs-extra');

exports.name = 'install|i';
exports.usage = '<component_git_url>';
exports.desc = 'install component from github or gitlab by <component_git_url>';

exports.run = function installCmd(compGitUrl) {
  var gitRepo = config.getConfig('repo');
  gitRepo = gitRepo || compGitUrl;
  if (!gitRepo) {
    console.error('github or gitlab repo url required!');
    process.exit(1);
  }
  var tmpDir = '.tmp';
  var cwd = util.getCwd();
  mkdir('-p', tmpDir);
  var repoName = path.parse(gitRepo).name;
  var cloneTemplate = [
    'git clone',
    gitRepo
  ].join(' ');
  var pagesDirName = config.getConfig('pages');
  var srcDir = config.getConfig('src');
  var templatePath = path.resolve(tmpDir, repoName);
  var distPagesDirPath = path.join(cwd, srcDir, pagesDirName);
  var distAppjsonPath = path.join(cwd, srcDir, 'app.json');
  var spinner = ora('downloading component template');
  spinner.start();
  
  if (!which('git')) {
    throw new Error('You should install git first');
    exit(1);
  }

  process.on('exit', function () {
    rm('-rf', tmpDir);
  });
  cd(tmpDir);
  console.log('');
  exec(cloneTemplate);
  cd(cwd);
  spinner.stop();
  glob(templatePath + '/*', function(er, files) {
    var parsedPath;
    var file;
    var pageNameArr = [];
    var base;
    for (var i = 0; i < files.length; i++) {
      file = files[i];
      if (util.isDir(file)) {
        parsedPath = path.parse(file);
        base = parsedPath.base;
        util.copySync(
          file,
          path.join(distPagesDirPath, base)
        );
        pageNameArr.push(base);
      }
    }

    fs.readJson(distAppjsonPath, function (err, jsonObj) {
      if (err) return console.error(err);

      pageNameArr.forEach(function (pageName) {
        // register page path to app.json
        jsonObj.pages.push(
          [
            pagesDirName,
            pageName,
            pageName
          ].join('/')
        );
      });

      // write modified json to app.json
      fs.outputJson(distAppjsonPath, jsonObj, function (err) {
        if (err) return console.error(err);

        console.log('component ' + repoName + ' has been installed!');
        emitter.emit('install');
      });
    });

  });
}