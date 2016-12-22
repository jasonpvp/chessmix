module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'sinon'],
    files: [
      'src/app.tests.js'
    ],
    preprocessors: {
      'src/app.tests.js': ['webpack']
    },
    exclude: [],
    reporters: ['mocha', 'notify'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    webpack: require('./webpack.config.js'),
    webpackMiddleware: {
      noInfo: true
    }
  })
}
