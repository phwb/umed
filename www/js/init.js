/* global require, $, _ */
require.config({
    urlArgs: "v=" + (new Date()).getTime(),
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
        // сторонние библиотеки
        fastclick: 'libs/fastclick/fastclick',
        jquery: 'libs/jquery/jquery-2.1.4',
        underscore: 'libs/underscore/underscore',
        backbone: 'libs/backbone/backbone',
        store: 'libs/backbone.localstorage/backbone.localStorage',
        backboneForm: 'libs/backbone.form/backbone-forms',
        text: 'libs/require/text',
        ymaps: 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=Map,Placemark',
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
    'app/helper/notify',
    'app/helper/download',
    // главные вьюшки
    'views/menu',
    'views/main'
], function (
    FastClick,
    Backbone,
    page,
    notify,
    checkResources,
    // главные вьюшки
    menu,
    pageMain
) {
    'use strict';

    // init FastClick
    FastClick.attach(document.body);

    // рисуем левое меню
    $('.panel').html( menu.render().el );
    $('.panel-overlay').click(function (e) {
        var $body = $('body');
        if ($body.hasClass('with-panel')) {
            $body.removeClass('with-panel');
        }
        e.preventDefault();
    });

    // page - вставляет в DOM страницы и анимирует их
    page.add(pageMain, function () {
        // после рендера главной страницы проверяем актуальность данных
        // и обновляем при необходимости
        checkResources();
    });

    // роутером выступает собыитя бекбона
    // для навигации лучше бы использоваль бекбоновский router,
    // но я почему то решил использовать события
    Backbone.Events.on('action:main', function () {
        page.add(pageMain);
    });

    Backbone.Events.on('action:policies', function () {
        require(['views/policies'], function (pagePolicies) {
            page.add(pagePolicies);
        });
    });

    Backbone.Events.on('policies:add', function (id) {
        require(['views/policies-add'], function (pageForm) {
            pageForm(id, function (error, formView) {
                page.add(formView);
            });
        });
    });

    Backbone.Events.on('policies:detail', function (id) {
        // используем нодовский подход, первый агрумент ошибка, потом все остальное
        require(['views/policies-detail'], function (pageDetail) {
            pageDetail(id, function (error, detailView) {
                if (error) {
                    // тут можно показать 404, но пока алерт
                    notify.alert(error);
                    return this;
                }
                page.add(detailView);
            });
        });
    });
    
    Backbone.Events.on('policies:check', function (enp) {
        require(['views/policies-check'], function (check) {
            check({
                enp: enp,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view, function () {
                        view.check();
                    });
                }
            });
        });
    });

    Backbone.Events.on('action:info', function () {
        require(['views/info'], function (pageInfo) {
            page.add(pageInfo);
        });
    });

    Backbone.Events.on('info:detail', function (code) {
        require(['views/info-detail'], function (detail) {
            detail({
                code: code,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('action:hospital', function () {
        require(['views/hospital'], function (pageHospital) {
            page.add(pageHospital);
        });
    });

    Backbone.Events.on('hospital:detail', function (id) {
        require(['views/hospital-detail'], function (detail) {
            detail({
                id: id,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });

    Backbone.Events.on('action:offices', function () {
        require(['views/offices'], function (pageOffices) {
            page.add(pageOffices);
        });
    });

    Backbone.Events.on('region:select', function () {
        require(['views/regions'], function (pageRegions) {
            page.add(pageRegions);
        });
    });

    Backbone.Events.on('office:detail', function (id) {
        require(['views/offices-detail'], function (detail) {
            detail({
                id: id,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view);
                }
            });
        });
    });
    
    Backbone.Events.on('map', function (model) {
        require(['views/map'], function (map) {
            map({
                model: model,
                callback: function (err, view) {
                    if (err) {
                        notify.alert(err);
                        return this;
                    }
                    page.add(view, function () {
                        view.renderMap();
                    });
                }
            });
        });
    });

    Backbone.Events.on('action:refresh', function () {
        checkResources(true);
    });
});
