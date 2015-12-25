/* global define, $, _ */
define([
    'backbone',
    'app/helper/notify',
    'collections/policies',
    'views/page',
    'text!templates/policies/detail.html',
    'text!templates/policies/detail-item.html'
], function (
    Backbone,
    notify,
    Policies,
    PageView,
    detailPage,
    detailItem
) {
    'use strict';

    var month = 'января февраля марта апреля мая июня июля августа сентября октября ноября декабря'.split(' ');
    _.template.formatDate = function (stamp) {
        var date = new Date(stamp),
            fragments = [
                date.getDate(),
                month[date.getMonth()],
                date.getFullYear()
            ];
        return fragments.join(' ');
    };

    var DetailView = Backbone.View.extend({
        template: _.template( detailItem ),
        initialize: function () {
            this.listenTo(this.model, 'change', this.change);
        },
        change: function () {
            this.model.save();
            this.render();
        },
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    // кеш детальных страниц, для предотвращения повторной генерации
    var details = {};
    return function (id, callback) {
        var policy = Policies.get(id);

        if (policy === undefined) {
            callback('Полис не найден!');
            return this;
        }

        // кэшируем отрендериные страницы, чтоб повторно не генерировать их
        if (details[id] === undefined) {
            /* --- Page view --- */
            var pageView = new PageView({
                html: detailPage,
                Page: {
                    events: {
                        'click .control-button_edit': 'edit',
                        'click .control-button_delete': 'remove'
                    },
                    edit: function (e) {
                        Backbone.Events.trigger('policies:add', policy.get('id'));
                        e.preventDefault();
                    },
                    remove: function () {
                        notify.confirm({
                            message: 'Вы действительно хотите удалить информацию о данном полисе?',
                            buttons: ['Нет', 'Да'],
                            title: 'Удалить полис',
                            callback: function (index) {
                                if (index > 1 || index === true) {
                                    policy.destroy();
                                    Backbone.Events.trigger('page:remove', details[id].page.cid);
                                    delete details[id];
                                }
                            }
                        });
                    },
                    init: function () {
                        this.$item = this.$('.detail');
                    },
                    render: function () {
                        var item = new DetailView({model: policy});
                        this.$item.html( item.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    events: {
                        'click .button': 'checkEnp'
                    },
                    checkEnp: function (e) {
                        Backbone.Events.trigger('policies:check', policy.get('enp'));
                        e.preventDefault();
                    }
                }
            });

            details[id] = pageView.init();
        }

        return callback(undefined, details[id]);
    };
});
