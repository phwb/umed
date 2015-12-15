/* global define */
define([
    'backbone',
    'collections/regions',
    'views/page',
    'text!templates/offices/index.html'
], function (
    Backbone,
    Regions,
    PageView,
    indexPage
) {
    'use strict';

    /* --- Page view --- */
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
                this.$name = this.$('.region-name');
                this.$name.text('Выберите регион');

                this.listenTo(Regions, 'reset', this.setButtonName);
                this.listenTo(Regions, 'change:selected', this.setButtonName);
            },
            setButtonName: function (obj, selected) {
                if (obj instanceof Backbone.Collection) {
                    this.$name.text( Regions.find({selected: true}).get('name') );
                } else if (obj instanceof Backbone.Model && selected === true) {
                    this.$name.text( obj.get('name') );
                }
            },
            selectRegion: function (e) {
                Backbone.Events.trigger('region:select');
                e.preventDefault();
            }
        }
    });

    return pageView.init();
});