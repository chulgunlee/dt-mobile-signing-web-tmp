var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    cache: true,
    entry: './signingroom/static/app/app.module.js',
    output: {
        path: 'signingroom/static',
        filename: 'bundle.js',
        sourceMapFilename: 'bundle.js.map',
        publicPath: 'static/',
    },
    module: {
        loaders: [
            { test: /\.html$/, loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './signingroom/static/app')) + '/!html' },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
            { test: /\.png*/, loader: 'file' },
            { test: /\.gif*/, loader: 'file' },
        ]
    },

    resolve: {
    },

    plugins: [
        new ExtractTextPlugin('[name].css', {
            allChunks: true
        })
    ]
};
