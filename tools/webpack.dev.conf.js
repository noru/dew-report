const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.conf')
const config = require('../config')

module.exports = merge(baseWebpackConfig, {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    app: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      './src/index.js'
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'react-hot-loader/webpack',
          'babel-loader'
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.s[ca]ss$/,
        exclude: [/src\/styles/, /node_modules/],
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              module: true,
              importLoaders: 2,
              localIdentName: '[local]__[hash:base64:5]'
            }
          },
          'postcss-loader',
          'sass-loader',
        ]
       },
       {
         test: /\.s[ca]ss$/,
         include: [/src\/styles/, /node_modules/],
         use: [
           'style-loader',
           {
             loader: 'css-loader',
             options: {
               importLoaders: 2
             }
           },
           'postcss-loader',
           'sass-loader'
         ]
       },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'less-loader',
            options: {
              modifyVars: require('./theme.js')
            }
          }
        ],
        include: /node_modules/
      },
      {
        test: /\.(jpg|jpeg|png|gif|ico|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'assets/[name].[hash].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': '"development"'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
      chunksSortMode: (c1, c2) => {
        const orders = ['common', 'vendor', 'app']
        const o1 = orders.indexOf(c1.names[0])
        const o2 = orders.indexOf(c2.names[0])
        return o1 - o2
      }
    }),
    new webpack.WatchIgnorePlugin([
      /node_modules/
    ]),
    new FriendlyErrorsPlugin()
  ],
  devServer: {
    noInfo: true,
    overlay: true,
    hot: true,
    publicPath: baseWebpackConfig.output.publicPath,
    stats: {
      colors: true
    },
    contentBase: path.join(__dirname, "../src"),
    watchContentBase: true,
    historyApiFallback: true,
    port: 8889,
  }
})
