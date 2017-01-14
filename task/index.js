var init = require('./cmd/init');
var generate = require('./cmd/generate');
var build = require('./cmd/build');
var install = require('./cmd/install');
var doc = require('./cmd/doc');
var tool = require('./cmd/tool');

module.exports = {
  init: init,
  generate: generate,
  gen: generate,
  build: build,
  install: install,
  i: install,
  doc: doc,
  d: doc,
  tool: tool,
  t: tool
}
