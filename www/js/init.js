/*global require, $, _*/
require.config({
    // remove after develop
    urlArgs: "v=" + (new Date()).getTime(),
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        backboneLocalStorage: {
            deps: [
                'backbone'
            ],
            exports: 'Store'
        },
        crypto: {
            exports: 'CryptoJS'
        }
    },
    paths: {
        // сторонние библиотеки
        fastclick: 'libs/fastclick/fastclick',
        jquery: 'libs/jquery/jquery-2.1.4',
        underscore: 'libs/underscore/underscore',
        backbone: 'libs/backbone/backbone',
        backboneLocalStorage: 'libs/backbone.localstorage/backbone.localStorage',
        backboneForm: 'libs/backbone.form/backbone-forms.min',
        text: 'libs/require/text',
        crypto: 'libs/crypto/sha1',
        // мои библиотеки
        page: 'libs/pages/page',
        // сокращения, чтоб постоянно не писать app
        collections: 'app/collections',
        templates: 'app/templates',
        models: 'app/models',
        views: 'app/views'
    }
});

require([
    'fastclick',
    'backbone',
    'page',
    'collections/policies',
    'views/main',
    'views/policies',
    'views/add',
    'views/detail'
], function (
    FastClick,
    Backbone,
    page,
    Policies,
    mainPage,
    policiesPage,
    formPage,
    detailPage
) {
    'use strict';

    // init FastClick
    FastClick.attach(document.body);

    // page - вставляет в DOM страницы и анимирует их
    page.add(mainPage);

    // роутором выступает собыитя бекбона
    // для навигации лучше бы использоваль бекбоновский router,
    // но я почему то решил использовать события
    Backbone.Events.on('action:policies', function () {
        page.add(policiesPage);
    });

    Backbone.Events.on('action:form', function (id) {
        formPage(id, function (error, formView) {
            page.add(formView);
        });
    });

    Backbone.Events.on('action:detail', function (id) {
        // используем нодовский подход, первый агрумент ошибка, потом все остальное
        detailPage(id, function (error, detailView) {
            if (error !== undefined) {
                // тут можно показать 404, но пока алерт
                alert(error);
                return this;
            }
            page.add(detailView);
        });
    });

    // not realized yet
    Backbone.Events.on('action:info', function () {
        alert('info page');
    });
    Backbone.Events.on('action:hospital', function () {
        alert('hospital page');
    });
    Backbone.Events.on('action:offices', function () {
        alert('offices page');
    });
});