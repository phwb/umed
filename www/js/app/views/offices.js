/* global define, require, $, _, ymaps, window */
/* jshint multistr: true */
define([
    'backbone',
    'app/helper/notify',
    // коллекции
    'collections/cities',
    'collections/offices',
    // генерация и шаблон страниц
    'views/page',
    'text!templates/offices/index.html'
], function (
    Backbone,
    notify,
    // коллекции
    Cities,
    Offices,
    // генерация и шаблон страниц
    PageView,
    indexPage
) {
    'use strict';

    /**
     * @property {function} ymaps.ready
     * @property {function} ymaps.Map
     * @property {function} ymaps.Placemark
     */

    function fill(id, callback) {
        callback = callback || $.noop;

        if (id === undefined) {
            callback('Выберите город');
            return false;
        }

        Offices.trigger('ajax', 'start');
        $.ajax({
            url: 'http://u-med.ru/local/api/city/' + id + '/offices/',
            dataType: 'json',
            error: function () {
                Offices.trigger('ajax', 'error');
                callback('Ошибка при соверешии запроса!');
                return false;
            },
            success: function (data) {
                var offices = _(data);

                if (!offices.isArray()) {
                    Offices.trigger('ajax', 'end');
                    callback('Не верный формат данных');
                    return this;
                }

                offices.each(function (item) {
                    var params = _.extend({city: id}, item);
                    Offices.create(params, {silent: true});
                }, this);

                Offices.trigger('ajax', 'end');
                callback();
            }
        });
    }

    var OfficeItem = Backbone.View.extend({
        tagName: 'li',
        className: 'teasers__i',
        events: {
            'click': 'detail'
        },
        detail: function (e) {
            e.preventDefault();
            Backbone.Events.trigger('office:detail', this.model.get('id'));
        },
        template: _.template('\
        <span class="teasers__a">\
            <span class="teasers__value"><%- name %></span>\
            <% if (address) { %>\
                <span class="teasers__label"><%- address %></span>\
            <% } %>\
            <svg class="teasers__icon">\
                <use xlink:href="#icon_right-arrow"></use>\
            </svg>\
        </span>\
        '),
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            this.delegateEvents();
            return this;
        }
    });

    var OfficeList = Backbone.View.extend({
        tagName: 'ul',
        className: 'teasers__lst',
        initialize: function (params) {
            this.city = params.city;
            this.listenTo(this.collection, 'reset', this.addAll);
        },
        addItem: function (item) {
            var office = new OfficeItem({model: item});
            this.$el.append( office.render().el );
        },
        addAll: function () {
            var offices = this.collection.where({city: this.city});

            if (offices.length > 0) {
                this.$el.empty();
                _(offices).each(this.addItem, this);
            }
        }
    });

    var OfficeMap = Backbone.View.extend({
        initialize: function (params) {
            var map = params.center || {
                    coords: {
                        value: [55.751574, 37.573856]
                    },
                    zoom: 12
                };

            ymaps.ready(function () {
                this.map = new ymaps.Map(this.$el[0], {
                    center: map.coords.value,
                    zoom: map.zoom
                });
            }.bind(this));

            this.city = params.city;
            this.addAll();
        },
        addAll: function () {
            var offices = this.collection.where({city: this.city});

            if (offices.length > 0) {
                ymaps.ready(function () {
                    _(offices).each(this.addItem, this);
                }.bind(this));
            }
        },
        addItem: function (item) {
            var coords = item.get('coords'),
                placemark;

            if (coords) {
                placemark = new ymaps.Placemark(coords.value, {}, {
                    iconLayout: 'default#image',
                    iconImageHref: './img/location.svg',
                    iconImageSize: [40, 40]
                });
                this.map.geoObjects.add(placemark);
            }
        },
        setCenter: function (map, city) {
            this.map.setCenter(map.coords.value, map.zoom);

            this.city = city;
            this.addAll();
        }
    });

    /* --- Page view --- */
    var list = {}, map;
    var pageView = new PageView({
        html: indexPage,
        Navbar: {
            title: 'Наши офисы'
        },
        Page: {
            events: {
                'click .region': 'selectRegion',
                'click .tabs__i': 'toggleView'
            },
            toggleView: function (e) {
                var $button = $(e.currentTarget),
                    action = $button.data('action');

                e.preventDefault();
                if ( $button.hasClass('tabs__i_active') ) {
                    return this;
                }

                $button.addClass('tabs__i_active').siblings().removeClass('tabs__i_active');
                switch (action) {
                    case 'list':
                        this.$map.hide();
                        this.$list.show();
                        break;
                    case 'map':
                        this.$list.hide();
                        this.$map.show();

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
                        break;
                }
            },
            renderMap: function () {
                var city = Cities.getSelected();
                if (!map) {
                    map = new OfficeMap({
                        el: this.$map,
                        collection: Offices,
                        center: city.get('map'),
                        city: city.get('id')
                    });
                } else {
                    map.setCenter(city.get('map'), city.get('id'));
                }
            },
            init: function () {
                // инициализация начального состояния
                this.$name = this.$('.region-name');
                this.$list = this.$('.list');
                this.$map = this.$('.map');
                this.$name.text('Выберите регион');
                // скрываем не нужные контролы
                this.$map.hide();

                // событие selected вызывается на старнице со списком городов
                // при нажатии на кнопку сохрнаить
                this.listenTo(Cities, 'selected reset', this.loadOffices);

                // событие ajax срабатывает когда города загрузились с сервера
                // вынес в отдельную функицю, потому что срабатывает один раз
                this.listenTo(Cities, 'ajax', this.loadCitiesComplete);

                // при аяксе показываем/скрываем лоадер
                this.listenTo(Offices, 'ajax', function (status) {
                    this.$('.page-content')[ status === 'start' ? 'addClass' : 'removeClass' ]('page_loader');
                }.bind(this));

                // загружаем города из локального хранилища
                if (!Cities.length) {
                    Cities.fetch({reset: true});
                } else {
                    this.loadCitiesComplete('success');
                }
            },
            loadCitiesComplete: function (status) {
                var id;
                // еще одно событие ajax при самой первой загрузке, когда нет ни каких данных
                // и reset срабатывает после аякс загрузки,
                // UDP: перенес на отдельное событие
                if (Cities.length > 0 && status === 'success') {
                    id = Cities.getSelected().get('id');
                    if (id) {
                        this.loadOffices(id);
                        return id;
                    }
                }
                return false;
            },
            loadOffices: function (arg) {
                var id, name, city;

                // arg может прийти в двух видах:
                // 1. на событие reset приходит коллекция
                // 2. на событие selected приходит айдишник города
                // в других случаях ничего приходить не должно ничего
                if (arg instanceof Backbone.Collection && arg.length > 0) {
                    city = arg.getSelected();
                    id = city.get('id');
                } else if (typeof arg === 'string') {
                    id = arg;
                    city = Cities.get(id);
                }

                // если не нашли айдишика города, то и делать тут не чего
                if (!id) {
                    return this;
                }

                name = city.get('name');
                if (name) {
                    this.$name.text(name);
                }

                // если карта проинициализирована, то установим новый центр карты
                if (map) {
                    map.setCenter(city.get('map'), id);
                }

                if (!list[id]) {
                    list[id] = new OfficeList({
                        collection: Offices,
                        city: id
                    });
                }

                Offices.fetch({reset: true});
                // пытаемся найти офисы в текщем городе
                var localOffices = Offices.where({city: id});
                // если их нет, делаем запрос
                if (!localOffices.length) {
                    fill(id, function (err) {
                        if (err) {
                            notify.alert(err);
                            return this;
                        }
                        Offices.trigger('reset');
                    }.bind(this));
                }

                this.$list.html( list[id].render().el );
            },
            selectRegion: function (e) {
                Backbone.Events.trigger('region:select');
                e.preventDefault();
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});
