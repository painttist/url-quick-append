const path = require('path');
let package = require('./package.json');

function modify(buffer) {
  // copy-webpack-plugin passes a buffer
  var manifest = JSON.parse(buffer.toString());

  // make any modifications you like, such as
  manifest.version = package.version;

  // pretty print to JSON with two spaces
  manifest_JSON = JSON.stringify(manifest, null, 2);
  return manifest_JSON;
}


const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");

const pages = ['popup', 'lazyloading', 'options']
const entries = ['popup', 'background', 'lazyloading', 'options']

module.exports = {
  entry: entries.reduce((config, entry) => {
    config[entry] = `./${entry}.js`;
    return config;
  }, {}),
  plugins: [].concat(
    pages.map(
      (page) =>
        new HtmlWebpackPlugin({
          inject: false,
          template: `./${page}.html`,
          filename: `${page}.html`,
          chunks: [page],
        })
    ),
    [
      new CopyPlugin({
        patterns: [
          { 
            from: "./manifest.json", 
            to: "./",
            transform (content, path) {
              return modify(content)
            }
          },
          {
            from: "./images/urlqa128.png", 
            to: "./images/",
          }
        ],
      }),
      new MiniCssExtractPlugin(),
    ]
  ),
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
};