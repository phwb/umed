/* global define, _ */
/* jshint multistr: true */
define([
    'backbone',
    'text!templates/lk/list.json',
    'views/page',
    'text!templates/lk/index.html'
], function (
    Backbone,
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
        template: _.template('<a href="<%= link %>" target="_system" class="items-list__a"><%= name %></a>'),
        render: function () {
            this.$el.html( this.template( this.model ) );
            return this;
        }
    });

    var InfoList = Backbone.View.extend({
        tagName: 'ul',
        className: 'items-list__lst',
        addItem: function (item) {
            var info = new InfoItem({model: item});
            this.$el.append( info.render().el );
        },
        addAll: function () {
            this.collection.forEach(this.addItem, this);
        },
        render: function () {
            this.addAll();
            return this;
        }
    });

    /* --- Page view --- */
    var pageView = new PageView({
        html: template,
        Navbar: {
            title: 'Личный кабинет'
        },
        Page: {
            init: function () {
                var infoView = new InfoList({
                    collection: list
                });
                this.$list = this.$('.items-list');
                this.$list.html( infoView.render().el );
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});