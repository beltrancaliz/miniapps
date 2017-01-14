var downloadTool = require('../download-tool');

exports.name = 'tool|t';
exports.usage = '';
exports.desc = 'download xiaochengxu latest tool';

exports.run = function downloadToolCmd() {
  downloadTool();
}
