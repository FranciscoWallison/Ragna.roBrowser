const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: './index.js', // Apontar para o diretório ./src
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    alias: {
      jquery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js'),
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    fallback: {
      process: require.resolve('process/browser'),
      util: require.resolve('util/'),
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      fs: false, // Ignorar 'fs' completamente
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'), // Incluir apenas ./src
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'), // Incluir apenas ./src
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/,
        include: path.resolve(__dirname, 'src'), // Incluir apenas ./src
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.txt$/,
        include: path.resolve(__dirname, 'src'), // Incluir apenas ./src
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|swf|jar)$/,
        include: path.resolve(__dirname, 'src'), // Incluir apenas ./src
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.gz$/,
        use: 'ignore-loader',
      },
      {
        test: /\.(md|yaml|java|Dockerfile|LICENSE)$/,
        use: 'ignore-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // Apontar para o ./src
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src', to: 'src' }],
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single',
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 8989,
  },
};
