require('babel-register')({
  presets: [
    ['env', {
      'targets': {
        'node': 'current'
      }
    }]
  ]
});

require('dotenv').config();

module.exports = require('./app.js');
