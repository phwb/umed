/*global require, $, _*/
require.config({
    // remove after develop
    urlArgs: "v=" + (new Date()).getTime(),
    shim: {
        store: {
            deps: [
                'backbone'
            ],
            exports: 'Store'
        }
    },
    paths: {
        // сторонние библиотеки
        fastclick: 'libs/fastclick/fastclick',
        jquery: 'libs/jquery/jquery-2.1.4',
        underscore: 'libs/underscore/underscore',
        backbone: 'libs/backbone/backbone',
        store: 'libs/backbone.localstorage/backbone.localStorage',
        backboneForm: 'libs/backbone.form/backbone-forms.min',
        text: 'libs/require/text',
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
    // главные вьюшки
    'views/main',
    'views/policies',
    'views/add',
    'views/detail',
    'views/offices',
    'views/info',
    'views/hospital',
    'views/regions'
], function (
    FastClick,
    Backbone,
    page,
    // главные вьюшки
    pageMain,
    pagePolicies,
    pageForm,
    pageDetail,
    pageOffices,
    pageInfo,
    pageHospital,
    pageRegions
) {
    'use strict';

    // init FastClick
    FastClick.attach(document.body);

    // page - вставляет в DOM страницы и анимирует их
    page.add(pageMain);

    // роутором выступает собыитя бекбона
    // для навигации лучше бы использоваль бекбоновский router,
    // но я почему то решил использовать события
    Backbone.Events.on('action:policies', function () {
        page.add(pagePolicies);
    });

    Backbone.Events.on('action:form', function (id) {
        pageForm(id, function (error, formView) {
            page.add(formView);
        });
    });

    Backbone.Events.on('action:detail', function (id) {
        // используем нодовский подход, первый агрумент ошибка, потом все остальное
        pageDetail(id, function (error, detailView) {
            if (error !== undefined) {
                // тут можно показать 404, но пока алерт
                alert(error);
                return this;
            }
            page.add(detailView);
        });
    });

    Backbone.Events.on('action:info', function () {
        page.add(pageInfo);
    });

    Backbone.Events.on('action:hospital', function () {
        page.add(pageHospital);
    });

    Backbone.Events.on('action:offices', function () {
        page.add(pageOffices);
    });

    Backbone.Events.on('region:select', function () {
        page.add(pageRegions);
    });
});
