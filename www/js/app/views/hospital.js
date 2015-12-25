/* global define, _, $ */
/* jshint multistr: true */
define([
    'backbone',
    'app/helper/notify',
    // коллекции
    'collections/cities',
    'collections/hospitals',
    // генерация и шаблон страниц
    'views/page',
    'text!templates/hospitals/index.html'
], function (
    Backbone,
    notify,
    // коллекции
    Cities,
    Hospitals,
    // генерация и шаблон страниц
    PageView,
    indexPage
) {
    'use strict';
    // вся информация описана на вьюшке офисов
    // больницы и офисы одинаковые

    function fill(id, callback) {
        callback = callback || $.noop;

        if (id === undefined) {
            callback('Выберите город');
            return false;
        }

        Hospitals.trigger('ajax', 'start');
        $.ajax({
            url: 'http://u-med.ru/local/api/city/' + id + '/hospitals/',
            dataType: 'json',
            error: function () {
                Hospitals.trigger('ajax', 'error');
                callback('Ошибка при соверешии запроса!');
                return false;
            },
            success: function (data) {
                var offices = _(data);

                if (!offices.isArray()) {
                    Hospitals.trigger('ajax', 'end');
                    callback('Не верный формат данных');
                    return this;
                }

                /**
                 * @param {object} item
                 * @property {Number} item.id
                 * @property {String} item.name
                 * @property {Array} item.props
                 */
                offices.each(function (item) {
                    var params = _.extend({city: id}, item);
                    Hospitals.create(params, {silent: true});
                }, this);

                Hospitals.trigger('ajax', 'end');
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
            Backbone.Events.trigger('hospital:detail', this.model.get('id'));
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
        initialize: function (params) {
            this.city = params.city;
            // параметры для псевдопостранички
            this.index = 0;
            this.limit = 10;

            this.$list = $('<ul class="teasers__lst" />');
            // кнопка для псевдопостранички
            this.$pager = $('<div class="button" />');
            this.$pager.text('Загрузить еще ' + this.limit).click(_.bind(this.addAll, this));
            // вставляем список и кнопку в DOM
            this.$el.html(this.$list).append(this.$pager);

            this.listenTo(this.collection, 'reset', this.addAll);
        },
        addItem: function (item) {
            var office = new OfficeItem({model: item});
            this.$list.append( office.render().el );
        },
        addAll: function () {
            var offices = this.collection.where({city: this.city});

            if (offices.length > 0) {
                var nextIndex = this.index + this.limit,
                    sliced = offices.slice(this.index, nextIndex);

                // если достигли конца массива с офисами прячем кнопку "загрузить еще"
                this.$pager[ offices.length > nextIndex ? 'show' : 'hide' ]();

                if (this.index === 0) {
                    this.$list.empty();
                }

                _(sliced).each(this.addItem, this);
                this.index += this.limit;
            } else {
                this.$pager.hide();
            }
        }
    });

    /* --- Page view --- */
    var list = {};
    var pageView = new PageView({
        html: indexPage,
        Navbar: {
            title: 'Больницы'
        },
        Page: {
            events: {
                'click .region': 'selectRegion'
            },
            selectRegion: function (e) {
                Backbone.Events.trigger('region:select');
                e.preventDefault();
            },
            init: function () {
                this.$name = this.$('.region-name');
                this.$list = this.$('.list');

                this.$name.text('Выберите регион');

                this.listenTo(Cities, 'selected reset', this.setButtonName);
                this.listenTo(Cities, 'selected reset', this.loadHospital);
                this.listenTo(Cities, 'ajax', this.loadCitiesComplete);

                this.listenTo(Hospitals, 'ajax', function (status) {
                    this.$('.page-content')[ status === 'start' ? 'addClass' : 'removeClass' ]('page_loader');
                }.bind(this));

                if (!Cities.length) {
                    Cities.fetch({reset: true});
                } else {
                    var id = this.loadCitiesComplete('success');
                    if (id) {
                        this.setButtonName(id);
                    }
                }
            },
            loadHospital: function (arg) {
                var id;

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
                        collection: Hospitals,
                        city: id
                    });
                }

                Hospitals.fetch({reset: true});
                // пытаемся найти офисы в текщем городе
                var localOffices = Hospitals.where({city: id});

                // если их нет, делаем запрос
                if (!localOffices.length) {
                    fill(id, function (err) {
                        if (err) {
                            notify.alert(err);
                            return this;
                        }
                        Hospitals.trigger('reset');
                    }.bind(this));
                }

                this.$list.html( list[id].render().el );
            },
            loadCitiesComplete: function (status) {
                var id;
                if (Cities.length > 0 && status === 'success') {
                    id = Cities.getSelected().get('id');
                    if (id) {
                        this.loadHospital(id);
                        return id;
                    }
                }
                return false;
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
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});