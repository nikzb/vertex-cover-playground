const webpack = require('webpack');

module.exports = {
  entry: {
    create: './dev/assets/js/create.js',
    puzzle: './dev/assets/js/puzzle.js',
    notFound: './dev/assets/js/notFound.js'
  },
  output: {
    path: './public/js',
    filename: '[name].js',
    libraryTarget: 'var',
    // If you need to keep various entry points separate, can try to do like this:
    // library: ['GlobalAccess', '[name]']
    library: 'EntryPoint'

  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        },
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Promise: 'imports-loader?this=>global!exports-loader?global.Promise!es6-promise',
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    })
  ]
};
