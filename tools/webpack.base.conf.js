const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const config = require('../config')
const GLOBALS = {
  __USE_MOCK__: JSON.stringify(JSON.parse(process.env.USE_MOCK || 'false')),
}

module.exports = {
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: config.distDir,
    publicPath: '/',
    sourceMapFilename: '[name].map'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'node_modules'
    ],
    alias: {
      '#': path.resolve(__dirname, '../src')
    }
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: 'assets'
    }])
  ]
}
