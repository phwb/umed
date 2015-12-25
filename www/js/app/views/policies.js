/*global define, _*/
define([
    'backbone',
    'collections/policies',
    'views/page',
    'text!templates/policies/policies.html'
], function (
    Backbone,
    Policies,
    PageView,
    listPage
) {
    'use strict';

    var PolicyItem = Backbone.View.extend({
        tagName: 'li',
        className: 'items-list__i',
        template: _.template('<a href="#detail/<%= id %>/" class="items-list__a"><%- fio %></a>'),
        events: {
            'click .items-list__a': 'detail'
        },
        initialize: function () {
            this.listenTo(this.model, 'remove', this.removeItem);
            this.listenTo(this.model, 'change', this.render);
        },
        removeItem: function () {
            this.remove();
        },
        detail: function (e) {
            Backbone.Events.trigger('policies:detail', this.model.get('id'));
            e.preventDefault();
        },
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    /* --- Page view --- */
    var pageView = new PageView({
        html: listPage,
        Page: {
            init: function () {
                this.$list = this.$('#policiesList');
                this.$empty = this.$('#emptyPolicy');

                this.listenTo(Policies, 'add', this.addItem);
                this.listenTo(Policies, 'remove', this.removeItem);
                this.listenTo(Policies, 'reset', this.addAll);

                Policies.fetch({reset: true});
            },
            addItem: function (model) {
                var item;

                if (model.isNew()) {
                    model.save();
                }

                item = new PolicyItem({model: model});
                this.$list.append( item.render().el );
                this.$empty.hide();
            },
            removeItem: function () {
                if (Policies.length < 1) {
                    this.$empty.show();
                }
            },
            addAll: function () {
                Policies.each(this.addItem, this);
            }
        },
        Toolbar: {
            events: {
                'click #policyAdd': 'showForm'
            },
            showForm: function () {
                Backbone.Events.trigger('policies:add');
            }
        }
    });

    return pageView.init();
});
