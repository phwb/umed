/* global define, _ */
/* jshint multistr: true */
define([
    'backbone',
    'collections/links',
    'views/page',
    'text!templates/lk/index.html'
], function (
    Backbone,
    links,
    PageView,
    template
) {
    'use strict';

    /* --- View --- */
    var InfoItem = Backbone.View.extend({
        tagName: 'li',
        className: 'items-list__i',
        template: _.template('<a href="<%= link %>" target="_system" class="items-list__a"><%= name %></a>'),
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    var InfoList = Backbone.View.extend({
        tagName: 'ul',
        className: 'items-list__lst',
        initialize: function () {
            this.listenTo(this.collection, 'add', this.addItem);
            this.listenTo(this.collection, 'reset', this.addAll);
        },
        addItem: function (item) {
            var link = new InfoItem({model: item});
            this.$el.append( link.render().el );
        },
        addAll: function () {
            this.collection.each(this.addItem, this);
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
                    collection: links
                });
                this.$list = this.$('.items-list');
                this.$list.html( infoView.render().el );

                links.fetch({reset: true});
            }
        },
        Toolbar: {
            show: false
        }
    });

    return pageView.init();
});