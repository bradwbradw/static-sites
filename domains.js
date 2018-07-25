const fs = require('fs');
const _ = require('lodash');

const domains = _.filter(fs.readdirSync(__dirname + '/sites'), domain => {
    return domain !== '.DS_Store';
  });

module.exports = domains;