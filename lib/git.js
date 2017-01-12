var _ = require('lodash');
var shell = require('shelljs');

var nameCache = {};
var emailCache = {};

module.exports = {
  gitname: function () {
    var name = nameCache[process.cwd()];

    if (name) {
      return name;
    }

    if (shell.which('git')) {
      console.log(shell.exec('git config --get user.name', { silent: true }).output);
      name = shell.exec('git config --get user.name', { silent: true }).output.trim();
      nameCache[process.cwd()] = name;
    }

    return name;
  },
  gitemail: function () {
    var email = emailCache[process.cwd()];

    if (email) {
      return email;
    }

    if (shell.which('git')) {
      email = shell.exec('git config --get user.email', { silent: true }).stdout.trim();
      emailCache[process.cwd()] = email;
    }

    return email;  
  }
};