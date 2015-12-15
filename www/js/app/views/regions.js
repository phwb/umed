/* global define, $, _ */
/* jshint multistr: true */
define([
    'backbone',
    'collections/regions',
    'collections/cities',
    'views/page',
    'text!templates/regions/index.html'
], function (
    Backbone,
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

    var RegionItem = Backbone.View.extend({
        tagName: 'li',
        className: 'more-items__i',
        template: _.template('<span class="more-items__a"><%- name %></span>'),
        events: {
            'click': 'changeSelectedRegion'
        },
        changeSelectedRegion: function () {
            var selected;
            // находит текщий выбранный регион
            selected = this.model.collection.find({selected: true});
            if (selected !== undefined) {
                selected.set('selected', false);
                selected.save();
            }

            this.model.set('selected', true);
            this.model.save();
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
            this.listenTo(this.collection, 'change:selected', this.changeRegion);

            this.collection.fetch({reset: true});
        },
        changeRegion: function (model, selected) {
            if (selected === true) {
                this.toggleOtherRegion().addAll();
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
            otherRegion = this.collection.without(selectedRegion);

            this.$selected.html( this.selectedTemplate( selectedRegion.toJSON() ) );
            this.$other.empty();
            _(otherRegion).each(this.addOtherRegion, this);
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

                if (!Regions.length/* || !Cities.length*/) {
                    fill(function () {
                        Regions.trigger('reset');
                        Cities.trigger('reset');
                    });
                }
            }
        }
    });

    return pageView.init();

    /*return function (id, callback) {
        /!*if (!Regions.length) {
            Regions.fill(function () {
                Regions.trigger('ajax:success');
                Cities.trigger('ajax:success');
            });
        }*!/

        return callback(undefined, view);
    };*/
});