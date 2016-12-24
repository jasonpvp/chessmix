var path = require('path')
var config = require('./config')
var webpack = require('webpack')

delete config.context
delete config.entry
delete config.output

config.devtool = 'cheap-module-source-map'

config.plugins = [
  new webpack.DefinePlugin({
    __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
    'process.env': {
      'NODE_ENV': '"test"'
    }
//  }),
//  new webpack.ProvidePlugin({
//    'sinon': 'sinon'
  })
]

config.module = {
  noParse: [ /sinon\.js/ ],
  loaders: [
    {
      test: /\.jsx?$/,
      loader: 'babel-loader',
      include: [
        path.join(__dirname, '../src')
      ],
      query: {
        plugins: ['rewire', 'transform-runtime'],
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

module.exports = config
