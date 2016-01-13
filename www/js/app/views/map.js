/* global define, require, ymaps, window */
define([
    'backbone',
    'views/page',
    'text!templates/offices/map.html'
], function (
    Backbone,
    // шаблоны
    PageView,
    mapPage
) {
    "use strict";

    var $ = Backbone.$,
        maps = {};

    return function (params) {
        var model = params.model || false,
            callback = params.callback || $.noop,
            id;

        if (!model) {
            callback('Не задана модель');
            return this;
        }

        id = model.get('id');
        if (!maps[id]) {
            var page = new PageView({
                html: mapPage,
                Navbar: {
                    title: model.get('name')
                },
                Page: {
                    init: function () {
                        this.$map = this.$('.map');
                        this.on('render:map', this.checkMap);
                    },
                    checkMap: function () {
                        // проверяем загружена ли карта
                        // если да, то просто ничего не делаем
                        if (maps[id].mapLoaded) {
                            return this;
                        }

                        if ('ymaps' in window) {
                            this.renderMap();
                        } else {
                            // грузим "Яндекс.Карты" только тогда, когда они нужны
                            // то есть по первому клику на кнопку "Карта"
                            this.$map.addClass('page_loader');
                            require(['ymaps'], function () {
                                this.$map.removeClass('page_loader');
                                this.renderMap();
                            }.bind(this));
                        }
                    },
                    renderMap: function () {
                        var coords = model.get('coords');
                        if (coords && coords.value) {
                            ymaps.ready(function () {
                                var map, placemark;
                                /** @property {object} map.geoObjects */
                                map = new ymaps.Map(this.$map[0], {
                                    center: coords.value,
                                    zoom: 16
                                });
                                placemark = new ymaps.Placemark(coords.value, {}, {
                                    iconLayout: 'default#image',
                                    iconImageHref: './img/location.svg',
                                    iconImageSize: [40, 40]
                                });
                                map.geoObjects.add(placemark);
                                // ставим флаг, что карта уже загружена
                                maps[id].mapLoaded = true;
                            }.bind(this));
                        }
                    }
                },
                Toolbar: {
                    show: false
                }
            });

            maps[id] = page.init();
            maps[id].renderMap = function () {
                this.page.trigger('render:map');
            };
        }

        return callback(undefined, maps[id]);
    };
});
