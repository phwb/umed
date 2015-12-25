/* global define, $ */
/* jshint multistr: true */
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
            }),
            $body: $('body')
        });

        return this;
    }

    var hiddenToolbar = {};
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

        if (!isAnimationEnd.apply(this)) {
            return this;
        }

        // ложим предыдущую страницу в массив для обратной навигации
        var prevPageID = this.page.$view.find('.' + this.page._settings.currentPageClass).data('page');
        if (prevPageID !== undefined) {
            this.pageCache.push(prevPageID);
        }

        // добавим навбар и колбек для кнокок назад, меню и т.д.
        navbar.data('page', currentPageID);
        this.navbar.addPage(navbar, this.addNavButton.bind(this, navbar));

        // добавим страницу в DOM
        this.page.addPage(page, callback);

        // добавим тулбар
        hiddenToolbar[currentPageID] = params.toolbar.show;
        toolbar.data('page', currentPageID);
        this.toolbar.addPage(toolbar, function () {
            // скрыаем если это определно в параметрах
            if (hiddenToolbar[currentPageID]) {
                this.page.$view.addClass('footer-through');
                this.toolbar.$view.css('bottom', '0');
            } else {
                this.page.$view.removeClass('footer-through');
                this.toolbar.$view.css('bottom', '-60px');
            }
        }.bind(this));
    };

    var menuButton = '\
        <div class="header__button nav-button" style="left: auto; right: 0;">\
            <div class="nav-button__body">\
                <div class="nav-button__i nav-button__i_top"></div>\
                <div class="nav-button__i nav-button__i_middle"></div>\
                <div class="nav-button__i nav-button__i_bottom"></div>\
            </div>\
        </div>';

    Page.prototype.addNavButton = function (navbar) {
        var backButton, navButton;

        backButton = navbar.find('.back-button');
        if (backButton.length && !backButton.data('init')) {
            backButton.data('init', true).click(this.back.bind(this));
        }

        navButton = navbar.find('.nav-button');
        if (navButton.length && !navButton.data('init')) {
            navButton.data('init', true).click(this.menu.bind(this));
        } else if (!navButton.data('init')) {
            navButton = $(menuButton).data('init', true).click(this.menu.bind(this));
            navbar.append(navButton);
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
        var currPageID = this.page.$view.find('.page-current').data('page');
        if (currPageID) {
            Backbone.Events.trigger('back:' + currPageID);
            Backbone.Events.trigger('back', {
                curr: currPageID,
                prev: params.page
            });
        }

        this.page.next(params);
        this.navbar.next(params);
        this.toolbar.next(params);

        if (hiddenToolbar[prevPage]) {
            this.page.$view.addClass('footer-through');
            this.toolbar.$view.css('bottom', '0');
        } else {
            this.page.$view.removeClass('footer-through');
            this.toolbar.$view.css('bottom', '-60px');
        }
    };

    Page.prototype.menu = function () {
        this.$body.addClass('with-panel');
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
