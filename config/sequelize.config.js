require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dialect = 'postgres';
let url;
if (env === "test") {
  url = process.env.TEST_DATABASE_URL;
} else if (env === "development") {
  url = process.env.DEV_DATABASE_URL;
} else {
  url = process.env.DATABASE_URL;
}

let devMode = false;
if ((env === 'development') || (env === 'test')) {
  devMode = true;
}
const config = {
  url,
  dialect,
  logging: function(str) {
    console.log(str)
  },
  dialectOptions: {
    multipleStatements: true
  }
};

if (!devMode) {
  config.ssl = true;
  config.dialectOptions.ssl = {
    require: !devMode
  };
}
module.exports = config;
