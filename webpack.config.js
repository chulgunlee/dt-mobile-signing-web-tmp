var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    cache: true,
    // entry: './dt_mobile_signing_web/signingroom/static/app/app.module.js',
    entry: {
        doclist: './dt_mobile_signing_web/signingroom/static/app/doclist.module.js',
        signingroom: './dt_mobile_signing_web/signingroom/static/app/signingroom.module.js',
    },
    output: {
        path: 'dt_mobile_signing_web/signingroom/static',
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].bundle.js.map',
        publicPath: 'static/',
    },
    module: {
        loaders: [
            { test: /\.html$/, loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './dt_mobile_signing_web/signingroom/static/app')) + '/!html' },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'raw')           // use raw-loader to prevent the `url()` in the css files being processed
            },
            {
                test: /\.scss$/,
                 loader: ExtractTextPlugin.extract(
                    'style',            // backup loader when not generating a .css file
                    'raw!sass')         // loaders used to generate css from sass
            },
            { test: /\.png*/, loader: 'file' },
            { test: /\.gif*/, loader: 'file' },
        ]
    },

    resolve: {
    },

    plugins: [
        // we don't want to embed css as <style> tag so use ExtractTextPlugin to generate separate css files
        new ExtractTextPlugin('[name].css', { allChunks: true }),

        // ng-annotate plugin to automatically add annotates to DI
        new ngAnnotatePlugin({ add: true }),

        new CompressionPlugin({ }),

        new CommonsChunkPlugin({ name: 'common', filename: 'common.js' })
    ]
};
