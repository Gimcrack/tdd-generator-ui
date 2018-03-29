const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('index.js', 'dist')
    .webpackConfig({
        resolve: {
            modules: [
                'node_modules'
            ],
            alias: {
                'vue$': 'vue/dist/vue.js',
                jquery: 'jquery/src/jquery'
            }
        }
    });

