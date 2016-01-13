/* global define, $ */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';

    var arMenu = [
        {
            name: 'Главная',
            action: 'main',
            selected: true
        },
        {
            name: 'Полисы',
            action: 'policies',
            selected: false
        },
        {
            name: 'Наши офисы',
            action: 'offices',
            selected: false
        },
        {
            name: 'Больницы',
            action: 'hospital',
            selected: false
        },
        {
            name: 'Информация',
            action: 'info',
            selected: false
        },
        {
            name: 'Обновить',
            action: 'refresh',
            selected: false
        }
    ];

    var MenuCollection = Backbone.Collection.extend({
        initialize: function () {
            this.listenTo(Backbone.Events, 'back', this.setSelected);
        },
        setSelected: function (page) {
            var model = this.find({action: page.prev});
            if (model) {
                this.find({selected: true}).set({selected: false});
                model.set({selected: true});
            }
        }
    });

    var Menu = new MenuCollection(arMenu);

    var MenuItem = Backbone.View.extend({
        tagName: 'li',
        className: 'panel-menu__i',
        events: {
            'click': 'navigate'
        },
        navigate: function (e) {
            var action = this.model.get('action');

            e.preventDefault();
            $('body').removeClass('with-panel');

            Backbone.Events.trigger('action', action);
            Backbone.Events.trigger('action:' + action);
        },
        initialize: function () {
            this.listenTo(this.model, 'change:selected', this.changeSelected);
            this.listenTo(Backbone.Events, 'action', this.changeAction);
        },
        changeSelected: function () {
            var selected = this.model.get('selected');
            this.$el[ selected ? 'addClass' : 'removeClass' ]('panel-menu__i_active');
        },
        changeAction: function (action) {
            var current = this.model.get('action'),
                selected = current === action;
            if (action === 'refresh') {
                return this;
            }
            this.model.set('selected', selected);
        },
        render: function () {
            this.$el.text( this.model.get('name')).addClass( this.model.get('action') );
            if (this.model.get('selected')) {
                this.$el.addClass('panel-menu__i_active');
            }
            return this;
        }
    });

    var MenuList = Backbone.View.extend({
        tagName: 'ul',
        className: 'panel-menu',
        render: function () {
            Menu.each(this.addItem, this);
            return this;
        },
        addItem: function (item) {
            var view = new MenuItem({model: item});
            this.$el.append( view.render().el );
        }
    });

    return new MenuList();
});
