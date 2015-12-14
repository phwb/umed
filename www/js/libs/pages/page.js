/* global define, $ */
define([
    'backbone',
    'libs/pages/pages'
], function (
    Backbone,
    Pages
) {
    'use strict';

    /**
     * Фабрика всей страницы, тут анимируются и добавляются navbar, page и toolbar
     *
     * @returns {Page}
     * @constructor
     */
    function Page() {
        if (!(this instanceof Page)) {
            return new Page();
        }

        this.pageCache = [];

        // события
        Backbone.Events.on('page:back', this.back.bind(this));
        Backbone.Events.on('page:remove', this.remove.bind(this));

        $.extend(this, {
            page: new Pages({
                effect: 'move'
            }),
            toolbar: new Pages({
                view: '.footer',
                effect: 'simpleFade'
            }),
            navbar: new Pages({
                view: '.header',
                effect: 'simpleFade'
            })
        });

        return this;
    }

    /**
     * @param {object} params
     * @property {Backbone.View} params.navbar
     * @property {Backbone.View} params.page
     * @property {Backbone.View} params.toolbar
     * @param {function=null} callback
     */
    Page.prototype.add = function (params, callback) {
        var navbar = params.navbar.render().$el,
            page = params.page.render().$el,
            toolbar = params.toolbar.render().$el,
            // айдишник страницы
            currentPageID = page.data('page');

        // ложим предыдущую страницу в массив для обратной навигации
        var prevPageID = this.page.$view.find('.' + this.page._settings.currentPageClass).data('page');
        if (prevPageID !== undefined) {
            this.pageCache.push(prevPageID);
        }

        // добавим навбар и колбек для кнокок назад, меню и т.д.
        navbar.data('page', currentPageID);
        this.navbar.addPage(navbar, this.addNavButton.bind(this, navbar));

        // добавим тулбар
        toolbar.data('page', currentPageID);
        this.toolbar.addPage(toolbar);

        // добавим страницу в DOM
        this.page.addPage(page, callback);
    };

    Page.prototype.addNavButton = function (navbar) {
        var backButton;

        backButton = navbar.find('.back-button');
        if (backButton.length && !backButton.data('init')) {
            backButton.data('init', true).click(this.back.bind(this));
        }
    };

    Page.prototype.back = function (args) {
        var prevPage = this.pageCache.pop(),
            params;

        if (prevPage === undefined) {
            return this;
        }

        params = {
            page: prevPage,
            direction: 'right'
        };

        if (args !== undefined) {
            params.callback = args.callback || $.noop;
        }

        this.page.next(params);
        this.navbar.next(params);
        this.toolbar.next(params);
    };

    /**
     * приватная функция проверят закончиалсь ли вся анимация
     * @returns {boolean}
     */
    function isAnimationEnd() {
        /* jshint validthis: true */
        return this.navbar._settings.animationStart === false &&
            this.page._settings.animationStart === false &&
            this.toolbar._settings.animationStart === false;
    }

    Page.prototype.remove = function (pageID) {
        if (pageID === undefined) {
            return this;
        }

        this.back({
            callback: function () {
                if (isAnimationEnd.apply(this)) {
                    // при событии удаления, так же удаляем страницы из DOM
                    ['navbar', 'page', 'toolbar'].forEach(function (key) {
                        var $item = this[key].$pages.filter(function () {
                            return $(this).data('page') === pageID;
                        });

                        if ($item.length > 0) {
                            $item.remove();
                        }
                    }, this);
                }
            }.bind(this)
        });
    };

    return new Page();
});
