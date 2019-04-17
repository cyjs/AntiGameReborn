const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    content: './src/content.js'
  },
  output: {
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      browser: 'webextension-polyfill'
    }),
  ]
};
