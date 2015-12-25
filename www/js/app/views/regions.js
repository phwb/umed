/* global define, $, _ */
/* jshint multistr: true */
define([
    'backbone',
    'app/helper/notify',
    'collections/regions',
    'collections/cities',
    'views/page',
    'text!templates/regions/index.html'
], function (
    Backbone,
    notify,
    Regions,
    Cities,
    PageView,
    indexPage
) {
    'use strict';

    function fill(callback) {
        callback = callback || $.noop;

        $.ajax({
            url: 'http://u-med.ru/local/api/regions/',
            dataType: 'json',
            error: function () {
                notify.alert('Ошибка интернет соединения!');
            },
            success: function (data) {
                var regions = _(data);
                if (regions.isArray() === false) {
                    return this;
                }

                /**
                 * добавляем регионы в коллекцию
                 *
                 * @property {Number} item.ID
                 * @property {String} item.NAME
                 * @property {Array} item.CITIES
                 */
                regions.each(function (item) {
                    Regions.create({
                        id: item.ID,
                        name: item.NAME
                    }, {silent: true});

                    var cities = _(item.CITIES);
                    if (cities.isArray() === false) {
                        return this;
                    }

                    /**
                     * добавляем города в коллекцию
                     *
                     * @property {Number} city.ID
                     * @property {String} city.NAME
                     */
                    cities.each(function (city) {
                        Cities.create({
                            id: city.ID,
                            name: city.NAME,
                            region: item.ID
                        }, {silent: true});
                    });
                });

                // устанавливаем по умолчанию первый активный регион и город
                var region, city;

                region = Regions.first();
                region.set({selected: true}, {silent: true}).save();

                city = Cities.find({region: region.get('id')});
                city.set({selected: true},  {silent: true}).save();

                callback();
            }
        });
    }

    /* ------------------ Список городов ------------------ */

    var CityItem = Backbone.View.extend({
        tagName: 'li',
        className: 'items-list__i',
        initialize: function () {
            this.listenTo(this.model, 'change:selected', this.changeSelectedCity);
        },
        changeSelectedCity: function (model, selected) {
            if (selected) {
                this.$el.addClass('items-list__i_active');
            } else {
                this.$el.removeClass('items-list__i_active');
            }
        },
        events: {
            'click': 'changeCity'
        },
        changeCity: function () {
            var selected;
            // находим текщий выбранный город
            selected = this.model.collection.find({selected: true});
            if (selected !== undefined) {
                selected.set('selected', false);
            }

            this.model.set('selected', true);
        },
        template: _.template('\
        <span class="items-list__a">\
            <%- name %>\
            <svg class="items-list__icon">\
                <use xlink:href="#icon_check"></use>\
            </svg>\
        </span>\
        '),
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            if (this.model.get('selected')) {
                this.$el.addClass('items-list__i_active');
            }
            return this;
        }
    });

    var CityList = Backbone.View.extend({
        initialize: function () {
            this.$list = $('<ul class="items-list__lst" />');
            this.render();

            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(Regions, 'change:selected', this.addAll);
        },
        addCity: function (city) {
            var item = new CityItem({model: city});
            this.$list.append( item.render().el );
        },
        addAll: function () {
            // ищес выбранный регион
            var region = Regions.find('selected', true);
            if (region === undefined) {
                return this;
            }
            // выбираем список городов для выбранного региона
            var list = this.collection.where({region: region.get('id')});
            if (list.length > 0) {
                this.$list.empty();
                _(list).each(this.addCity, this);
            }
        },
        render: function () {
            this.$el
                .empty()
                .append(this.$list);

            return this;
        }
    });

    /* ------------------ Список регионов ------------------ */

    var RegionItem = Backbone.View.extend({
        tagName: 'li',
        className: 'more-items__i',
        template: _.template('<span class="more-items__a"><%- name %></span>'),
        events: {
            'click': 'changeSelectedRegion'
        },
        changeSelectedRegion: function () {
            var selected;
            // находим текщий выбранный регион
            selected = this.model.collection.find({selected: true});
            if (selected !== undefined) {
                selected.set('selected', false);
            }

            this.model.set('selected', true);
        },
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    var RegionList = Backbone.View.extend({
        events: {
            'click .sub-header_select': 'toggleOtherRegion'
        },
        toggleOtherRegion: function () {
            this.$selected.toggleClass('sub-header_open');
            this.$other.slideToggle(300);
            return this;
        },
        selectedTemplate: _.template('\
        <div class="sub-header__h">\
            <%- name %>\
            <svg class="sub-header__select-icon">\
                <use xlink:href="#icon_down-arrow"></use>\
            </svg>\
        </div>\
        '),
        initialize: function () {
            this.$selected = $('<div class="sub-header sub-header_select" />');
            this.$other = $('<ul class="more-items__lst" style="display: none;" />');
            this.render();

            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'change:selected', this.changeSelectedRegion);
        },
        changeSelectedRegion: function (model, selected) {
            if (selected === true) {
                this.addAll();
                if (this.$selected.hasClass('sub-header_open')) {
                    this.toggleOtherRegion();
                }
            }
        },
        addOtherRegion: function (region) {
            var view = new RegionItem({model: region});
            this.$other.append( view.render().el );
        },
        addAll: function () {
            var selectedRegion, otherRegion;

            selectedRegion = this.collection.find('selected', true);
            if (selectedRegion === undefined) {
                return this;
            }
            this.$selected.html( this.selectedTemplate( selectedRegion.toJSON() ) );

            otherRegion = this.collection.without(selectedRegion);
            if (otherRegion.length > 0) {
                this.$other.empty();
                _(otherRegion).each(this.addOtherRegion, this);
            }

            // изначально элемент скрытый, пока не загрузился с сервера,
            // после окончания загрузки его нужно показать
            this.$el.show();
            return this;
        },
        render: function () {
            this.$el
                .empty()
                .append( this.$selected )
                .append( this.$other );
            return this;
        }
    });

    /* --- Page view --- */

    var prevRegion, prevCity;
    var pageView = new PageView({
        html: indexPage,
        Navbar: {
            title: 'Изменить регион'
        },
        Page: {
            init: function () {
                var regions = new RegionList({
                    collection: Regions,
                    el: this.$('.region-list')
                });

                var cities = new CityList({
                    collection: Cities,
                    el: this.$('.city-list')
                });

                // загружаем регионы и города из локального хранилища
                if (!Regions.length) {
                    Regions.fetch({reset: true});
                } else {
                    regions.addAll();
                }

                if (!Cities.length) {
                    Cities.fetch({reset: true});
                } else {
                    cities.addAll();
                }

                // если после этого они пустые, то грузим их с сервера
                if (!Regions.length || !Cities.length) {
                    fill(function () {
                        Regions.trigger('reset');
                        Cities.trigger('reset').trigger('ajax', 'success');

                        prevRegion = Regions.getSelected();
                        prevCity = Cities.getSelected();
                    });
                } else {
                    prevRegion = Regions.getSelected();
                    prevCity = Cities.getSelected();
                }
            }
        },
        Toolbar: {
            events: {
                'click .cancel': 'cancel',
                'click .save': 'save'
            },
            save: function () {
                // выбираем текущую выбранную модель и сохраняем ее тольков случае если она изменилась
                // изменяется она только тогда, когда выбирается другой регион
                var selectedRegion = Regions.getSelected();
                if (selectedRegion !== prevRegion) {
                    selectedRegion.save(null, {
                        success: function () {
                            prevRegion.set({selected: false}).save(null, {
                                success: function () {
                                    prevRegion = selectedRegion;
                                }
                            });
                        }
                    });
                }
                // тоже самое из городами
                var selectedCity = Cities.getSelected();
                if (selectedCity !== prevCity) {
                    selectedCity.save(null, {
                        success: function () {
                            prevCity.set({selected: false}).save(null, {
                                success: function () {
                                    prevCity = selectedCity;
                                    Cities.trigger('selected', prevCity.get('id'));
                                }
                            });
                        }
                    });
                }

                Backbone.Events.trigger('page:back');
            },
            cancel: function () {
                Regions.getSelected().set({selected: false}).save();
                prevRegion.set({selected: true}).save();

                Cities.getSelected().set({selected: false}).save();
                prevCity.set({selected: true}).save();

                Backbone.Events.trigger('page:back');
            }
        }
    });

    return pageView.init();
});