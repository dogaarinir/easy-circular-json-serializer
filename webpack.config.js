const path = require('path');
const nodeExternals = require('webpack-node-externals');


const {NODE_ENV = 'production',} = process.env;

module.exports = {
  entry: './src/index.ts',
  mode: NODE_ENV,
  target: 'node',
  watch: false, /* if false, webpack returns immediately. Otherwise it will watch for filesystem changes */
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js'
  },
  externals: [nodeExternals()],
  module: {
    rules: [{
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['node_modules']
  }
}