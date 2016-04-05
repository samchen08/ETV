module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                "laxcomma": true,
                evil: true,
                expr: true,
                loopfunc: true
            },
            src: ['src/**/*.js']
        },
        uglify: {

            etv: {
                options: {
                    banner: '/*! APPEngine version: 1.0.0 (included TVUI)  build: <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %>  by: chenhuachun@gzsimware.com */\n',
                    mangle: {
                        except: ['require', 'exports', 'module']
                    }
                },
                files: {
                    'build/socket/etv.engine.min.js': ['build/etv.engine.js'],
                    'build/http/etv.engine.min.js': ['build/etv.engine.http.js']
                }
            },
            loader: {
                options: {
                    banner: '/*! loader.js for APPEngine version: 1.0.0  build: <%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %>  by: chenhuachun@gzsimware.com */\n',
                    mangle: {
                        except: ['jQuery', 'Backbone', 'require', 'exports', 'module', 'Zepto', 'TVUI']
                    }
                },
                files: {
                    'build/loader.min.js': ['src/loader.js']
                }
            }
        },
        copy: {
            js: {
                files: [
                    {expand: true, cwd: 'build', src: ['**/*'], dest: 'apps/engine/js'}
                ]
            }
        },
        concat: {
            etv: {
                options: {
                    include: 'all',
                    noncmd: true,
                    separator: ';\n'
                },
                files: {
                    'build/etv.engine.js': ['lib/tvui.core.js', 'lib/socket.io/socket.io.js', 'src/etv.engine.js'],
                    'build/etv.engine.http.js': ['lib/tvui.core.js', 'src/etv.engine.http.js']
                }
            }
        },
        clean: ["temp"]

    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('etv', ['concat:etv', 'jshint', 'uglify', 'copy', 'clean']);
    grunt.registerTask('default', ['etv']);
};