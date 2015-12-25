/* global define, require, $ */
define([
    'backbone',
    'app/helper/notify',
    'views/page',
    'text!templates/info/detail.html'
], function (
    Backbone,
    notify,
    PageView,
    template
) {
    'use strict';

    var details = {},
        path = './static/#CODE#.html';

    /**
     * @params {Object} params
     * @property {String} params.code
     * @property {Function} params.code
     */
    return function (params) {
        var code = params.code || '',
            callback = params.callback || $.noop;

        if (!code) {
            callback('Неизвестная страница');
            return this;
        }

        if (!details[code]) {
            var page = new PageView({
                html: template,
                Navbar: {
                    title: 'Информация'
                },
                Page: {
                    init: function () {
                        this.$page = this.$('.page-content');
                        this.$page.addClass('page_loader');

                        $.ajax({
                            url: path.replace('#CODE#', code),
                            type: 'GET',
                            dataType: "html"
                        })
                            .done(this.done.bind(this))
                            .fail(this.fail.bind(this));
                    },
                    done: function (html) {
                        this.$page.removeClass('page_loader');
                        this.$page.html(html);
                    },
                    fail: function () {
                        this.$page.removeClass('page_loader');
                        notify.alert('Файл не найден');
                    }
                },
                Toolbar: {
                    show: false
                }
            });

            details[code] = page.init();
        }

        return callback(null, details[code]);
    };
});