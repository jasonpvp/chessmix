module.exports = {
  context: __dirname + "/src",
  entry: {
    javascript: "./index.jsx",
    html: "./index.html",
  },

  output: {
    filename: "app.js",
    path: __dirname + "/dist"
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss']
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader?stage=0"],
      },
      {
        test: /\.html$/,
        loader: "file?name=[name].[ext]",
      },
      {
        test: /\.s?css$/,
        loader: 'style!css!autoprefixer-loader?browsers=last 2 versions!sass'
      }
    ],
  }
}
