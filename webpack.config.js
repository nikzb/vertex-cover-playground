module.exports = {
  entry: {
    create: './dev/assets/js/create.js',
    puzzle: './dev/assets/js/puzzle.js'
  },
  output: {
    path: './public/js',
    filename: '[name].js',
    libraryTarget: 'var',
    // If you need to keep various entry points separate, can try to do like this:
    //library: ['GlobalAccess', '[name]']
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
  }
}
