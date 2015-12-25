/* global define, _ */
/* jshint multistr: true */
define([
    'backbone',
    'text!templates/info/list.json',
    'views/page',
    'text!templates/info/index.html'
], function (
    Backbone,
    json,
    PageView,
    template
) {
    'use strict';

    var list = JSON.parse(json);

    /* --- Model --- */
    var Info = Backbone.Model.extend({
        defaults: {
            name: '',
            code: '',
            sort: 100
        }
    });
    /* --- Collection --- */
    var InfoCollection = Backbone.Collection.extend({
        model: Info
    });
    var info = new InfoCollection();

    /* --- View --- */
    var InfoItem = Backbone.View.extend({
        tagName: 'li',
        className: 'items-list__i',
        events: {
            'click': 'click'
        },
        click: function (e) {
            e.preventDefault();
            Backbone.Events.trigger('info:detail', this.model.get('code'));
        },
        template: _.template('<span class="items-list__a"><%- name %></span>'),
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    var InfoList = Backbone.View.extend({
        tagName: 'ul',
        className: 'items-list__lst',
        initialize: function () {
            this.listenTo(info, 'add', this.addItem);
        },
        addItem: function (item) {
            var info = new InfoItem({model: item});
            this.$el.append( info.render().el );
        }
    });

    /* --- Page view --- */
    var pageView = new PageView({
        html: template,
        Navbar: {
            title: 'Информация'
        },
        Page: {
            init: function () {
                this.$list = this.$('.items-list');

                var infoView = new InfoList();
                this.$list.html( infoView.render().el );

                _(list).each(function (item) {
                    info.add(item);
                });
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});