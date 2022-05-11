var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: "source-map",

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.html$/,
        use: [{
          loader: "html-loader"
        },],
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  entry: {
    bundle: './src/js/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: '[name].[contenthash].js', 
    filename: "main.js",//'[name].[hash].js', //Dev
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 5000
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
  ]
};