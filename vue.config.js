const path = require('path');
const crypto = require("crypto");
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm);

module.exports = {
  chainWebpack: (config) => {
    config
      .entry('app')
      .clear()
      .add('./src/client/main.js')
      .end();
    config
      .resolve.alias
      .set('@', path.join(__dirname, './src/client'));
  },
  devServer: {
    proxy: {
      '^/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
};
