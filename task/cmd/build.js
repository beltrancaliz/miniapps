var fs = require('fs-extra');
var path = require('path');
var compile = require('../compile');

exports.name = 'build';
exports.usage = '';
exports.desc = 'build sass -> wxss,stylus -> wxss,ES6 -> ES5';

exports.run = function buildCmd() {
  compile.build();
}