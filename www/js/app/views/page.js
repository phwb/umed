/*global define, $, _*/
define([
    'backbone',
    'text!templates/default.html'
], function (
    Backbone,
    defaultHtml
) {
    'use strict';

    var html;
    /**
     * Функция генерирует объект страницы, на вход подаются шаблон страницы,
     * при необходимости можно переопределить или добавить поведение навбар, тело страницы и тулбар
     * на выходе получаются объекты Backbone.View
     *
     * Для генерации страницы нужно вызвать функцию init()
     *
     * @param params
     * @property {string} params.html - шаблон всей страницы, при инициализации режется на навбар, тело и тулбар
     * @property {object} params.Navbar - переопределение стандартного поведения
     * @property {object} params.Page - переопределение стандартного поведения
     * @property {object} params.Toolbar - переопределение стандартного поведения
     * @returns {PageView}
     * @constructor
     */
    function PageView(params) {
        params = params || {};
        html = $('<div />').html(params.html || defaultHtml);

        this.Navbar = params.Navbar || {};
        this.Page = _.extend({
            init: $.noop
        }, params.Page || {});
        this.Toolbar = _.extend({
            init: $.noop,
            show: true
        }, params.Toolbar || {});

        return this;
    }

    PageView.prototype.init = function () {
        var self = this;

        var Navbar = Backbone.View.extend(_.extend({
            className: 'page',
            initialize: function () {
                var navbar = html.find('.navbar'),
                    extraClass = navbar.attr('class').replace('navbar', '').trim();

                this.$el.html(navbar.html()).addClass(extraClass);

                if (!!self.Navbar.title) {
                    this.$('.header__h').text(self.Navbar.title);
                }
            }
        }, this.Navbar));

        var Page = Backbone.View.extend(_.extend({
            className: 'page',
            initialize: function () {
                var page = html.find('.content'),
                    extraClass = page.attr('class').replace('content', '').trim();

                if (!!self.Page.cid) {
                    this.cid = self.Page.cid;
                }

                this.$el
                    .html(page.html())
                    .addClass(extraClass)
                    .data('page', this.cid);

                this.init.apply(this, arguments);
            }
        }, this.Page));

        var Toolbar = Backbone.View.extend(_.extend({
            className: 'page',
            initialize: function () {
                var toolbar = html.find('.toolbar');
                this.$el.html(toolbar.html());

                this.init.apply(this, arguments);
            }
        }, this.Toolbar));

        return {
            navbar: new Navbar(),
            page: new Page(),
            toolbar: new Toolbar()
        };
    };

    return PageView;
});