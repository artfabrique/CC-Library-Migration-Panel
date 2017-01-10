/**
 * Copyright 2016 Alexander Vinogradov
 * All rights reserved.
 */

'use strict';

module.exports = function (grunt)
{
    grunt.initConfig({

        concat: {
            dist: {
                src: [
                    //Utils
                    './src/js/lib/json2.js',
                    './src/extendscript/lib/shims.jsx',
                    './src/extendscript/lib/core.jsx',
                    './src/extendscript/lib/Host.jsx',


                    './src/extendscript/lib/constants.jsx',
                    './src/extendscript/lib/util.jsx',
                    './src/extendscript/lib/color.jsx',
                    './src/extendscript/lib/brush.jsx',
                    './src/extendscript/lib/text.jsx',
                    './src/extendscript/lib/layerstyle.jsx',




                    './src/extendscript/lib/XMLLib.jsx',
                    './src/extendscript/lib/XMPLib.jsx',
                    './src/extendscript/lib/PsdLib.jsx',

                    './src/extendscript/app.jsx'
                ],
                dest: './src/extendscript/me.revenga.cclibrarymigration.jsx'
            }
        },

        // Extension debug and packaging
        cep: {
            options: require('./bundle/cep-config.js'),

            debug: {
                options: {
                    profile: 'launch',
                },
            },

            release: {
                options: {
                    profile: 'package',
                },
            },
        },

        open: {
            main: {
                path: 'http://localhost:8000',
                app: 'Google Chrome'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-concat');

    // Load grunt-cep tasks
    grunt.loadNpmTasks('grunt-cep');
    grunt.loadNpmTasks('grunt-open');

    grunt.registerTask('debug', ['concat', 'cep:debug','open']);
    grunt.registerTask('release', ['concat','cep:release']);
};
