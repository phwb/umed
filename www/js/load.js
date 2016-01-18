/* global define, require */
define([
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
    /** @namespace document.body */
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
        require([
            'collections/hospitals',
            'views/object-list'
        ], function (
            Hospitals,
            list
        ) {
            list({
                uid: 'hospital',
                collection: Hospitals,
                title: 'Больницы',
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
        require([
            'collections/offices',
            'views/object-list'
        ], function (
            Offices,
            list
        ) {
            list({
                uid: 'offices',
                collection: Offices,
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

    Backbone.Events.on('object:detail', function (model) {
        require(['views/object-detail'], function (detail) {
            detail({
                model: model,
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

    Backbone.Events.on('region:select', function () {
        require(['views/regions'], function (pageRegions) {
            page.add(pageRegions);
        });
    });

    Backbone.Events.on('map', function (model) {
        require(['views/object-map'], function (map) {
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

    return true;
});
