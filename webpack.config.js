module.exports = {
  entry: {
    create: "./dev/assets/js/create.js",
    puzzle: "./dev/assets/js/puzzle.js"
  },
  output: {
    path: "./dev/bundle/js",
    filename: "[name].js"
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
