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
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css')
            },
            {
                test: /\.scss$/,
                 loader: ExtractTextPlugin.extract(
                    'style',            // backup loader when not generating a .css file
                    'css!sass')         // loaders used to generate css from sass
            },
            //{ test: /\.scss$/, loader: 'style!css!sass' },
            { test: /\.png*/, loader: 'file' },
            { test: /\.gif*/, loader: 'file' },
        ]
    },

    resolve: {
    },

    plugins: [
        // we don't want to embed css as <style> tag so use ExtractTextPlugin to generate separate css files
        new ExtractTextPlugin('[name].css', {
            allChunks: true
        })
    ]
};
