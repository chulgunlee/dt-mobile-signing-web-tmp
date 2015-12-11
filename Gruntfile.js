'use strict';



module.exports = function(grunt) {

    require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

    var webpack = require('webpack'),
        webpackConfig = require('./webpack.config.js');

    

    grunt.initConfig({

        sprite: {
            all: {
                src: ['dt-mobile-signing-room/signingroom/static/assets/img/icons/*.png'],
                retinaSrcFilter: ['dt-mobile-signing-room/signingroom/static/assets/img/icons/*@2x.png'],
                dest: 'dt-mobile-signing-room/signingroom/static/assets/img/icon-sprite.png',
                retinaDest: 'dt-mobile-signing-room/signingroom/static/assets/img/icon-sprite@2x.png',
                destCss: 'dt-mobile-signing-room/signingroom/static/assets/css/icon-sprite.css',
                padding: 2,
                cssVarMap: function(sprite) {
                    var parts = sprite.name.split('.');

                    if (parts[1] == 'active' || parts[1] == 'hover') {
                        sprite.name= parts[0] + ':' + parts[1];
                    } else if (parts[1] == 'disabled' || parts[1] == 'checked') {
                        sprite.name = parts[0] + '[' + parts[1] + ']';
                    }
                },
            },
        },

        webpack: {
            options: webpackConfig,
            build: {
                watch: false,
                plugins: webpackConfig.plugins.concat(
                    new webpack.optimize.DedupePlugin(),
                    new webpack.optimize.UglifyJsPlugin()
                ),
            },

            'build-dev': {
                devtool: 'sourcemap',
                debug: true,
            },
        },

        "webpack-dev-server": {
            options: {
                webpack: webpackConfig,
                contentBase: 'dt-mobile-signing-room/signingroom/',
                proxy: {
                    "*": "http://localhost:8001",
                },
                publicPath: "/" + webpackConfig.output.publicPath
            },

            start: {
                keepAlive: true,
                port: 8000,
                webpack: {
                    //devtool: 'eval', 
                    debug: true
                }
            },
        },

    });

    grunt.registerTask('sprite', [ 'sprite' ]);
    grunt.registerTask('build', [ 'webpack:build' ]);
    grunt.registerTask('dev', [ 'webpack:build-dev' ]);
    grunt.registerTask('default', [ 'webpack-dev-server:start' ]);

};
