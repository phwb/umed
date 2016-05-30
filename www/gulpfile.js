"use strict";

/* global require */
var gulp = require('gulp'),
    rjs = require ('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename');

var dist = {
    root: './build/www/'
};

gulp.task('rjs', function () {
    rjs({
        baseUrl: './js',
        name: 'init',
        shim: {
            store: {
                deps: ['backbone'],
                exports: 'Store'
            },
            ymaps: {
                exports: 'ymaps'
            }
        },
        paths: {
            requireLib: 'libs/require/require',
            // сторонние библиотеки
            fastclick: 'libs/fastclick/fastclick',
            jquery: 'libs/jquery/jquery-2.1.4',
            underscore: 'libs/underscore/underscore',
            backbone: 'libs/backbone/backbone',
            store: 'libs/backbone.localstorage/backbone.localStorage',
            backboneForm: 'libs/backbone.form/backbone-forms',
            text: 'libs/require/text',
            swipe: 'libs/touchSwipe/jquery.touchSwipe',
            ymaps: 'empty:',
            // мои библиотеки
            page: 'libs/pages/page',
            // сокращения, чтоб постоянно не писать app
            collections: 'app/collections',
            templates: 'app/templates',
            models: 'app/models',
            views: 'app/views',
            // динамически подлкючаемая часть в файле init.js
            'views/policies': 'app/views/policies',
            'views/policies-add': 'app/views/policies-add',
            'views/policies-detail': 'app/views/policies-detail',
            'views/policies-check': 'app/views/policies-check',
            'views/info': 'app/views/info',
            'views/info-detail': 'app/views/info-detail',
            'views/regions': 'app/views/regions',
            'views/object-list': 'app/views/object-list',
            'views/object-detail': 'app/views/object-detail',
            'views/object-map': 'app/views/object-map',
            'views/lk': 'app/views/lk'
        },
        include: [
            'requireLib',
            // динамически подлкючаемая часть в файле init.js
            'views/policies',
            'views/policies-add',
            'views/policies-detail',
            'views/policies-check',
            'views/info',
            'views/info-detail',
            'views/regions',
            'views/object-list',
            'views/object-detail',
            'views/object-map',
            'views/lk'
        ],
        out: 'build.js'
    })
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename = 'build.min';
        }))
        .pipe(gulp.dest(dist.root + 'js'));
});

gulp.task('static', function () {
    /*gulp.src(['./static/!*']).pipe(gulp.dest(dist.root + 'static'));
    gulp.src(['./upload/!*']).pipe(gulp.dest(dist.root + 'upload'));*/
    gulp.src(['./img/*']).pipe(gulp.dest(dist.root + 'img'));
    gulp.src(['./index.html']).pipe(gulp.dest(dist.root));
    gulp.src(['./css/fonts/*']).pipe(gulp.dest(dist.root + 'css/fonts'));
    gulp.src(['./js/svg.js']).pipe(gulp.dest(dist.root + 'js'));
    // копируем ресурсы
    gulp.src(['../res/**/*']).pipe(gulp.dest('./build/res'));
    gulp.src(['../config.xml']).pipe(gulp.dest('./build'));
});

gulp.task('css', function () {
    // TODO: допилить CSS сжатие
    var paths = [
        './css/fonts.css',
        './css/animations/move.css',
        './css/animations/fade.css',
        './css/common.css',
        './css/style.css'
    ];
    gulp.src(paths)
        .pipe(minifyCSS())
        .pipe(rename(function(path) {
            path.basename = path.basename + '.min';
        }))
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest(dist.root + 'css'));
});

gulp.task('default', ['rjs', 'css', 'static']);
