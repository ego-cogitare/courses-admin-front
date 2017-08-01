const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  entry: './src/app.jsx',
  devtool: null,
  output: {
    path: "./public",
    publicPath: "./",
    filename: 'app.[hash].min.js'
  },
  module: {
    loaders: [
      {
        test : /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader : 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0'],
          plugins: [
            'transform-decorators-legacy',
            'transform-class-properties',
            'react-html-attrs'
          ]
        }
      },
      {
        test: /\.(css|scss)$/,
        loader: ExtractTextPlugin.extract('style', 'css')
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=images/[name].[ext]"
      },
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      }
    ]
  },
  resolve: {
    extensions: ['.js', ''],
    alias: {
      config: path.resolve(__dirname, './src/config/config.prod'),
    }
  },
  plugins: [
    new webpack.ProvidePlugin({ config: 'config' }),
    new WebpackCleanupPlugin({
      exclude: ['dev.html', 'vendors/**/*', 'icons/**/*'],
    }),
    new HtmlWebpackPlugin({
      title: 'Admin panel',
      inject: false,
      template: 'src/staticFiles/index.ejs',
      externalSources: {
        css: [
          './vendors/font-awesome/css/font-awesome.min.css',
          './vendors/bootstrap/dist/css/bootstrap.min.css',
          './vendors/trumbowyg/dist/ui/trumbowyg.min.css',
          './vendors/trumbowyg/dist/plugins/colors/ui/trumbowyg.colors.min.css',
        ],
        js: [
          './vendors/jquery/jquery.min.js',
          './vendors/jquery-file-download/src/Scripts/jquery.fileDownload.js',
          './vendors/trumbowyg/dist/trumbowyg.min.js',
          './vendors/trumbowyg/dist/plugins/colors/trumbowyg.colors.js',
          './vendors/trumbowyg/dist/plugins/table/trumbowyg.table.min.js',
          './vendors/bootstrap/dist/js/bootstrap.min.js',
        ]
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true
      }
    }),
    new ExtractTextPlugin("app.[hash].min.css"),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false })
  ]
};
