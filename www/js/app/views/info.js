/* global define, _ */
/* jshint multistr: true */
define([
    'backbone',
    'collections/infos',
    'text!templates/info/list.json',
    'views/page',
    'text!templates/info/index.html'
], function (
    Backbone,
    info,
    json,
    PageView,
    template
) {
    'use strict';

    var list = JSON.parse(json);

    /* --- View --- */
    var InfoItem = Backbone.View.extend({
        tagName: 'li',
        className: 'items-list__i',
        events: {
            'click': 'click'
        },
        click: function (e) {
            e.preventDefault();
            Backbone.Events.trigger('info:detail', this.model.get('id'));
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
            this.listenTo(info, 'reset', this.addAll);
        },
        addItem: function (item) {
            var info = new InfoItem({model: item});
            this.$el.append( info.render().el );
        },
        addAll: function () {
            info.each(this.addItem, this);
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

                //this.listenTo()

                var infoView = new InfoList();
                this.$list.html( infoView.render().el );

                info.fetch({reset: true});
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});