// Copyright (c) 2018 Dominic Masters
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const
  path = require('path'),
  fs = require('fs'),

  webpack = require('webpack'),
  SharpLoader = require('responsive-loader/sharp'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  CompressionPlugin = require("compression-webpack-plugin"),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  MiniCssExtractPlugin = require("mini-css-extract-plugin"),
  OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
;

const base = path.resolve(`${__dirname}/../..`);

// export webpack config
module.exports = (isDev) => {
  if(typeof isDev === typeof undefined) isDev = false;

  //Base (Production) Configuration.
  let config = {
    devtool: 'source-map',
    entry: [ `${base}/public/index.jsx` ],
    output: { path: `${base}/dist`, filename: "app.js" },
    mode: isDev ? 'development' : 'production',
    resolve: {
      modules: [`${base}/node_modules`, `${base}/public`],
      extensions: ['.js', '.jsx', '.css', '.scss' ],
      alias: {
        '@public':  `${base}/public`,
        '@objects': `${base}/public/objects`,
        '@components': `${base}/public/components`,
        '@assets': `${base}/public/assets`,
        '@pages': `${base}/public/pages`,
        '@styles': `${base}/public/styles`,
        '@sections': `${base}/public/components/section`
      }
    },

    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    "targets": {
                      "node": "current",
                      "browsers": [ "Chrome >= 41", "FireFox >= 44", "Safari >= 7", "Explorer 11", "last 4 Edge versions" ]
                    },
                    "useBuiltIns": false
                  }
                ],
                "@babel/preset-react"
              ],
              "plugins": [ '@babel/plugin-syntax-dynamic-import' ]
            }
          }
        },

        {
          test: /\.scss$|\.css$/i,
          exclude: /node_modules/,
          use: isDev ? (
            [ "style-loader", "css-loader", 'sass-loader' ]
          ) : (
            [ MiniCssExtractPlugin.loader, "css-loader", 'sass-loader' ]
          )
        },

        {
          test: /\.svg$|\.webm$|\.mp4$/i,
          exclude: /node_modules/,
          use: [{
            loader: "file-loader",
            options: { name: "[path][name].[ext]", context: 'public' }
          }]
        },

        {
          test: /\.jpe?g$|\.gif$|\.png$/i,
          exclude: /node_modules/,
          use: [{
            loader: "responsive-loader",
            options: {
              adapter: SharpLoader,
              sizes: [250, 500, 750, 1000, 1500, 2000, 2500],
              name: "[path][name]_[width]x.[ext]",
              context: 'public'
            }
          }]
        },

        {
          test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
          loader: 'url-loader'
        }
      ]
    },

    plugins: []
  };

  //Setup the Plugins
  let HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: `${base}/public/index.html`,
    filename: 'index.html',
    inject: true
  });

  config.plugins = [
    ...config.plugins,
    HTMLWebpackPluginConfig
  ]

  //Dev Setting Overrides
  if(isDev) {
    config = {
      ...config,
      devtool: 'cheap-module-eval-source-map',
      plugins: [
        ...config.plugins,
        new webpack.HotModuleReplacementPlugin()
      ]
    };
  } else {
    let UglifyPluginConfig = new UglifyJsPlugin({
      test: /\.js($|\?)/i
    });

    let MiniCssExtractConfig = new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    });

    config = {
      ...config,
      plugins: [
        ...config.plugins,
        MiniCssExtractConfig,
        HTMLWebpackPluginConfig
      ],
      optimization: {
        minimize: true,
        minimizer: [
          UglifyPluginConfig,
          MiniCssExtractConfig,
          new OptimizeCSSAssetsPlugin({}),
        ]
      }
    };
  }

  return config;
};
