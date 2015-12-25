/* global define, $ */
/* jshint multistr: true */
define([
    'backbone',
    'views/page',
    'text!templates/policies/check.html'
], function (
    Backbone,
    PageView,
    template
) {
    'use strict';

    var defaultParams = {
        url: 'http://u-med.ru/local/api/policy/',
        method: 'GET',
        type: 'json',
        crossDomain: true
    };

    var message = {
        'found': '<h2>Данные найдены!</h2>Ваш полис является действующим',
        'not-found': '<h2>Соответствия не найдены!</h2> Проверьте корректность введенной Вами информации или обратитесь ' +
            'в службу поддержки по номеру <a href="tel:88001008606">8 800 100 86 06</a>',
        'error': '<h2>Ошибка!</h2> Проверьте Ваше интернет-соединение и попробуйте снова. В случае повторной ошибки ' +
            'Вы можете обратиться в службу поддержки по номеру: <a href="tel:88001008606">8 800 100 86 06</a>'
    };

    var check = {};
    return function (params) {
        var enp = params.enp || false,
            callback = params.callback || $.noop;

        if (!enp) {
            callback('Не указан единый номер полиса');
            return this;
        }

        if (!check[enp]) {
            var pageView = new PageView({
                html: template,
                Page: {
                    events: {
                        'click .button': 'back'
                    },
                    back: function (e) {
                        Backbone.Events.trigger('page:back');
                        e.preventDefault();
                    },
                    init: function () {
                        this.$page = this.$('.page-content');
                        this.$message = this.$('.check-message');
                        this.$text = this.$('.check-message__text');

                        this.listenTo(Backbone.Events, 'back:' + this.cid, this.hideMessage);
                        this.on('check', this.check);
                    },
                    hideMessage: function () {
                        this.$message.hide();
                    },
                    check: function () {
                        params = $.extend({}, defaultParams, {
                            data: {
                                enp: enp
                            }
                        });

                        this.$message.hide();
                        this.$page.addClass('page_loader');
                        $.ajax(params)
                            .done(this.ajaxSuccess.bind(this))
                            .fail(this.ajaxFail.bind(this));
                    },
                    ajaxSuccess: function (data) {
                        var key, item = {
                            success: false
                        };

                        this.$page.removeClass('page_loader');
                        this.$message.show();
                        if (!data) {
                            this.$text.html(message.error);
                            return this;
                        }

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
                                if (item.text === 'Данных о введенном полисе ОМС не найдено') {
                                    this.$text.html(message['not-found']);
                                    return this;
                                }
                                this.$text.html(item.text);
                                //this.$text.html(message.found);
                                return this;
                            }
                        }
                        this.$text.html(message['not-found']);
                    },
                    ajaxFail: function () {
                        this.$page.removeClass('page_loader');
                        this.$message.show();
                        this.$text.html(message.error);
                    }
                },
                Toolbar: {
                    show: false
                }
            });
            check[enp] = pageView.init();

            check[enp].check = function () {
                this.page.trigger('check');
            };
        }

        return callback(null, check[enp]);
    };
});
