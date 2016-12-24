var path = require('path')

module.exports = {
  context: __dirname + "/../src",
  entry: {
    javascript: "./index.jsx",
    html: "./index.html",
  },

  output: {
    filename: "app.js",
    path: __dirname + "../dist"
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [
          path.join(__dirname, '../src')
        ],
        query: {
          plugins: ['transform-runtime'],
          presets: ['es2015', 'stage-0', 'react'],
        }
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.s?css$/,
        loader: 'style!css!autoprefixer-loader?browsers=last 2 versions!sass'
      }
    ]
  }
}
