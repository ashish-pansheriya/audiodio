var argv = require('yargs').argv;
var VERSION = argv.version || require('./package.json').version;

module.exports = {
  version: VERSION,
  //we are hard coding login values for local deployment for now. login would come with a production release if ever that happens.
  usernames: {
    sam: {
      USER: 'sam'
    },
    will: {
      USER: 'will'
    }
  }
};
