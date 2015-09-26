var path = require('path');
var webpack = require('webpack');

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
        ]
    },

    resolve: {
    },

    plugins: [
    ]
};
