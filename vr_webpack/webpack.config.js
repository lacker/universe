module.exports = {
  context: __dirname + '/ide',
  entry: './ide.js',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      }
    ]
  },

  output: {
    filename: 'app.js',
    path: __dirname + '/bundled'
  }
}
