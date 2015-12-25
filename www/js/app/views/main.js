/*global define, $, _*/
define([
    'backbone',
    'views/page',
    'text!templates/main/main.html',
    'text!templates/main/menu-item.html'
], function (
    Backbone,
    PageView,
    mainPage,
    menuItem
) {
    'use strict';

    /* --- Menu start --- */
    var arMenu = [
        {
            "name": "Полисы",
            "icon": "policies",
            "action": "policies"
        },
        {
            "name": "Информация",
            "icon": "info",
            "action": "info"
        },
        {
            "name": "Больницы",
            "icon": "hospital",
            "action": "hospital"
        },
        {
            "name": "Наши офисы",
            "icon": "offices",
            "action": "offices"
        }
    ];

    var menuCollection = new Backbone.Collection(arMenu);

    var MenuItem = Backbone.View.extend({
        tagName: 'li',
        className: 'main-nav__i',
        template: _.template( menuItem ),
        events: {
            'click .main-nav__a': 'click'
        },
        click: function (e) {
            var action = this.model.get('action');

            Backbone.Events.trigger('action', action);
            Backbone.Events.trigger('action:' + action);

            e.preventDefault();
        },
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    var MenuList = Backbone.View.extend({
        tagName: 'ul',
        className: 'main-nav__lst',
        addItem: function (item) {
            var view = new MenuItem({model: item});
            this.$el.append( view.render().el );
        },
        render: function () {
            this.collection.each(this.addItem, this);
            return this;
        }
    });
    /* --- Menu end --- */

    /* --- Page view --- */
    var pageView = new PageView({
        html: mainPage,
        Page: {
            cid: 'main',
            render: function () {
                var menu = new MenuList({collection: menuCollection});
                this.$('#nav').html( menu.render().el );
                return this;
            }
        }
    });

    return pageView.init();
});