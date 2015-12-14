"use strict";

var gulp = require('gulp'),
    rjs = require ('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('rjs', function () {
    rjs({
        baseUrl: './js',
        name: 'init',
        shim: {
            backboneLocalStorage: {
                deps: ['backbone'],
                exports: 'Store'
            }
        },
        paths: {
            requireLib: 'libs/require/require',
            // сторонние библиотеки
            fastclick: 'libs/fastclick/fastclick',
            jquery: 'libs/jquery/jquery-2.1.4',
            underscore: 'libs/underscore/underscore',
            backbone: 'libs/backbone/backbone',
            backboneLocalStorage: 'libs/backbone.localstorage/backbone.localStorage',
            backboneForm: 'libs/backbone.form/backbone-forms.min',
            text: 'libs/require/text',
            // мои библиотеки
            page: 'libs/pages/page',
            // сокращения, чтоб постоянно не писать app
            collections: 'app/collections',
            templates: 'app/templates',
            models: 'app/models',
            views: 'app/views'
        },
        include: ["requireLib"],
        out: 'build.js'
    })
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename = 'build.min'
        }))
        .pipe(gulp.dest('./build/'));
});

gulp.task('default', ['rjs']);
