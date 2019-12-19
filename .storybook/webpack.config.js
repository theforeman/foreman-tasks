const babelOptions = require('../.babelrc.js');
let path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions,
      },
      {
        test: /(\.png|\.gif)$/,
        loader: 'url-loader?limit=32767',
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                // teach webpack to resolve patternfly dependencies
                path.resolve(
                  __dirname,
                  '..',
                  'node_modules',
                  'patternfly',
                  'dist',
                  'sass'
                ),
                path.resolve(
                  __dirname,
                  '..',
                  'node_modules',
                  'bootstrap-sass',
                  'assets',
                  'stylesheets'
                ),
                path.resolve(
                  __dirname,
                  '..',
                  'node_modules',
                  'font-awesome-sass',
                  'assets',
                  'stylesheets'
                ),
              ],
            },
          },
        ],
      },
      {
        test: /\.md$/,
        loaders: ['raw-loader'],
      },
      {
        test: /(\.ttf|\.woff|\.woff2|\.eot|\.svg|\.jpg)$/,
        loaders: ['url-loader'],
      },
    ],
  },

  resolve: {
    alias: {
      foremanReact: path.join(
        __dirname,
        '../../foreman/webpack/assets/javascripts/react_app'
      ),
    },
    modules: [
      path.join(__dirname, '..', 'webpack'),
      path.join(__dirname, '..', 'node_modules'),
      'node_modules/',
    ],
  },
};
