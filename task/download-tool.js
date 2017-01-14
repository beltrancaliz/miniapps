var opener = require('opener');

module.exports = function downloadTool() {
  var type = 'x64';
  if (process.platform === "win32") {
    type = 'ia32';
  } else if (process.platform === "darwin") {
    type = 'darwin';
  }
  var downloadUrl = 'https://servicewechat.com/wxa-dev-logic/download_redirect?type=' + type + '&from=mpwiki';
  opener(downloadUrl);
}
