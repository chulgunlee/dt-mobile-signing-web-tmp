'use strict';

module.exports = function(grunt) {

    grunt.initConfig({

        sprite: {
            all: {
                src: ['signingroom/static/assets/img/icons/*.png'],
                retinaSrcFilter: ['signingroom/static/assets/img/icons/*@2x.png'],
                dest: 'signingroom/static/assets/img/icon-sprite.png',
                retinaDest: 'signingroom/static/assets/img/icon-sprite@2x.png',
                destCss: 'signingroom/static/assets/css/icon-sprite.css',
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
            build: {
                entry: './signingroom/static/app/app.module.js',
                output: {
                    path: 'signingroom/static',
                    filename: 'bundle.js',
                    sourceMapFilename: 'bundle.js.map',
                },
                module: {
                    loaders: [
                        { test: /\.html$/, loader: 'ngtemplate!html' },
                    ]
                },
                watch: false,
                devtool: '#source-map',
            },
        },
    });

    // load modules
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-webpack');
    
    grunt.registerTask('sprite', [ 'sprite' ]);
    grunt.registerTask('build', [ 'webpack:build' ]);

};
