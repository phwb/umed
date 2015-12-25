/* global define, require, $, _ */
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

    /* --- Page view --- */
    var list = {};
    var pageView = new PageView({
        html: indexPage,
        Navbar: {
            title: 'Наши офисы'
        },
        Page: {
            events: {
                'click .region': 'selectRegion'
            },
            init: function () {
                // инициализация начального состояния
                this.$name = this.$('.region-name');
                this.$list = this.$('.list');
                this.$tabs = this.$('.tabs');
                this.$map = this.$('.map');
                // скрываем не нужные контролы
                this.$name.text('Выберите регион');
                //this.$list.hide();
                this.$tabs.hide();
                this.$map.hide();

                // событие reset вызывается когда втянули аяксом или из локального хранилища
                this.listenTo(Cities, 'selected reset', this.setButtonName);
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
                    var id = this.loadCitiesComplete('success');
                    if (id) {
                        this.setButtonName(id);
                    }
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
                var id;

                // arg может прийти в двух видах:
                // 1. на событие reset приходит коллекция
                // 2. на событие selected приходит айдишник города
                // в других случаях ничего приходить не должно ничего
                if (arg instanceof Backbone.Collection && arg.length > 0) {
                    id = arg.getSelected().get('id');
                } else if (typeof arg === 'string') {
                    id = arg;
                }

                if (id === undefined) {
                    return this;
                }

                if (list[id] === undefined) {
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
            setButtonName: function (arg) {
                var name;

                if (arg instanceof Backbone.Collection && arg.length > 0) {
                    name = arg.getSelected().get('name');
                } else if (typeof arg === 'string') {
                    name = Cities.get(arg).get('name');
                }

                if (!name) {
                    return this;
                }
                this.$name.text(name);
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
