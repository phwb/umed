/* global define, $, _ */
define([
    'backbone',
    'crypto',
    'collections/policies',
    'views/page',
    'text!templates/policies/detail.html',
    'text!templates/policies/detail-item.html'
], function (
    Backbone,
    CryptoJS,
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

    var checkSettings = {
        salt: 'ajjvjdb(*hdsadsnasd80Y(T^(I90idasfj',
        url: 'http://u-med.ru/local/api/policy/',
        method: 'GET',
        type: 'json'
    };

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
                    edit: function () {
                        Backbone.Events.trigger('action:form', policy.get('id'));
                    },
                    remove: function () {
                        if (confirm('Вы уверены, что хотите удалить полис?')) {
                            policy.destroy();
                            Backbone.Events.trigger('page:remove', details[id].page.cid);
                            delete details[id];
                        }
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
                        var enp = policy.get('enp'),
                            params;

                        e.preventDefault();
                        if (enp === undefined) {
                            alert('Единый номер полиса не введен');
                            return this;
                        }

                        params = {
                            url: checkSettings.url,
                            type: checkSettings.method,
                            dataType: checkSettings.type,
                            crossDomain: true,
                            data: {
                                enp: enp
                            }
                        };

                        $.ajax(params)
                            .done(this.ajaxSuccess.bind(this))
                            .fail(this.ajaxFail.bind(this));
                    },
                    ajaxSuccess: function (data) {
                        var key, item = {
                            success: false
                        };
                        if (data.success === true) {
                            for (key in data) {
                                if (data.hasOwnProperty(key) && key !== 'success') {
                                    if (data[key].success === true) {
                                        item = data[key];
                                        break;
                                    }
                                }
                            }
                            if (item.success === true) {
                                console.log(item);
                            }
                        }
                    },
                    ajaxFail: function () {
                        alert('Ошибка при совершении запроса');
                    }
                }
            });

            details[id] = pageView.init();
        }

        return callback(undefined, details[id]);
    };
});