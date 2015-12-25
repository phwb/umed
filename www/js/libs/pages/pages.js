/**
 * Inspirited by Codrops: A Collection of Page Transitions
 * @link: http://tympanus.net/codrops/2013/05/07/a-collection-of-page-transitions/
 */
/*global define*/
define([
    'jquery',
    'app/helper/notify'
], function (
    $,
    notify
) {
    'use strict';

    var version = '0.0.1';

    // event support
    var animationEndEventName = (function () {
        var key, el = document.createElement('div'),
            animationEndEventNames = {
                'WebkitAnimation': 'webkitAnimationEnd',
                'OAnimation': 'oAnimationEnd',
                'msAnimation': 'MSAnimationEnd',
                'animation': 'animationend'
            };
        for (key in animationEndEventNames) {
            if (animationEndEventNames.hasOwnProperty(key)) {
                if (el.style[key] !== undefined) {
                    return animationEndEventNames[key];
                }
            }
        }
    } ());

    /* Helper Function */

    function getAnimationEffect(params) {
        var options = $.extend({
            effect: 'move',
            direction: 'left'
        }, params);

        var effects = {
            move: {
                left: {
                    current: 'page-moveToLeft',
                    next: 'page-moveFromRight'
                },
                right: {
                    current: 'page-moveToRight',
                    next: 'page-moveFromLeft'
                },
                top: {
                    current: 'page-moveToTop',
                    next: 'page-moveFromBottom'
                },
                bottom: {
                    current: 'page-moveToBottom',
                    next: 'page-moveFromTop'
                }
            },
            simpleFade: {
                left: {
                    current: 'page-fade',
                    next: 'page-moveFromRight page-ontop'
                },
                right: {
                    current: 'page-fade',
                    next: 'page-moveFromLeft page-ontop'
                },
                top: {
                    current: 'page-fade',
                    next: 'page-moveFromBottom page-ontop'
                },
                bottom: {
                    current: 'page-fade',
                    next: 'page-moveFromTop page-ontop'
                }
            },
            slideFade: {
                left: {
                    current: 'page-moveToLeftFade',
                    next: 'page-moveFromRightFade'
                },
                right: {
                    current: 'page-moveToRightFade',
                    next: 'page-moveFromLeftFade'
                },
                top: {
                    current: 'page-moveToTopFade',
                    next: 'page-moveFromBottomFade'
                },
                bottom: {
                    current: 'page-moveToBottomFade',
                    next: 'page-moveFromTopFade'
                }
            },
            easingMove: {
                left: {
                    current: 'page-moveToLeftEasing page-ontop',
                    next: 'page-moveFromRight'
                },
                right: {
                    current: 'page-moveToRightEasing page-ontop',
                    next: 'page-moveFromLeft'
                },
                top: {
                    current: 'page-moveToTopEasing page-ontop',
                    next: 'page-moveFromBottom'
                },
                bottom: {
                    current: 'page-moveToBottomEasing page-ontop',
                    next: 'page-moveFromTop'
                }
            }
        };

        return effects[ options.effect ][ options.direction ] || effects.move.left;
    }

    /**
     * приватная функция инициализации для конструктора Pages
     * по факту в объекте она не нужна, вот и вынес ее сюда
     */
    function init() {
        /*jshint validthis: true*/
        this.$view = $(this.params.view);
        if (!this.$view.length) {
            throw new Error('View not found');
        }

        this.$pages = $(this.params.pages, this.$view);
        if (this.$pages.length) {
            this.$pages.first().addClass(this._settings.currentPageClass);
        }
    }

    /**
     * Функция иницилизирует эффект слайда старниц.
     * На вход можно подать любой родительский тег, по умолчанию .pages
     *
     * @param {Object} params
     * @constructor
     */
    function Pages(params) {
        var defaults = {
            view: '.pages',
            pages: '.page',
            effect: 'move'
        };
        this.version = version;
        // параметры jQuery объектов
        this.params = $.extend({}, defaults, params);
        // внутренние настройки
        this._settings = {
            animationStart: false,
            currentClassList: '',
            nextClassList: '',
            endCurrentPage: false,
            endNextPage: false,
            currentPageClass: 'page-current'
        };

        try {
            init.apply(this);
        } catch (e) {
            notify.alert(e.message);
        }
    }

    /**
     * @param {jQuery} $page
     * @param {Function=null} callback
     */
    Pages.prototype.addPage = function ($page, callback) {
        var pageID, cache;
        callback = callback || $.noop;

        if (!($page instanceof $)) {
            throw new Error('Need jQuery object');
        }

        // проверяем если уже такие старницы, чтоб не происходило дублирование
        pageID = $page.data('page');
        cache = this.$pages.filter(function () {
            return $(this).data('page') === pageID;
        });
        if (!cache.length) {
            this.$view.append($page);
            this.$pages = $(this.params.pages, this.$view);
        }

        if (this.$pages.length === 1) {
            $page.addClass(this._settings.currentPageClass);
            callback();
        } else {
            this.next({
                page: $page.data('page'),
                callback: callback
            });
        }
    };

    Pages.prototype.next = function (params) {
        var effect, self = this,
            currentPage = null, nextPage = null,
            page = params.page, callback = params.callback || $.noop;

        // ничего не делаем, если анимация в процессе
        if (this._settings.animationStart) {
            return this;
        }

        // ищем текущую и следующую страницу
        currentPage = this.$pages.filter('.' + this._settings.currentPageClass);
        nextPage = this.$pages.filter(function () {
            return $(this).data('page') === page;
        });
        if (!nextPage.length) {
            return this;
        }
        // если следующая страница и так иммет активный класс, то ничего не делаем
        // срабатывает в случае если переход был из выезжающего меню
        if (nextPage.hasClass(this._settings.currentPageClass)) {
            return this;
        }

        // сохраняем ориганильные классы каждой страницы
        this._settings.currentClassList = currentPage.attr('class').replace(this._settings.currentPageClass, '').trim();
        this._settings.nextClassList = nextPage.attr('class') + ' ' + this._settings.currentPageClass;

        // делаем видимой следующую страницу
        nextPage.addClass(this._settings.currentPageClass);

        this._settings.animationStart = true;
        // получаем эффект анимации
        var effectParams = $.extend({
            effect: 'move',
            direction: 'left'
        }, {
            effect: this.params.effect
        }, {
            direction: params.direction
        });
        effect = getAnimationEffect(effectParams);

        // page-overlay добавил для того чтобы не срабатывали клики, до завершения анимации страницы
        var pageOverlay = $('<div class="page-overlay" />');
        currentPage.append(pageOverlay).addClass(effect.current).on(animationEndEventName, function() {
            currentPage.off(animationEndEventName);
            self._settings.endCurrentPage = true;
            if (self._settings.endNextPage) {
                self.onEndAnimation(currentPage, nextPage, callback);
            }
        });

        nextPage.append(pageOverlay).addClass(effect.next).on(animationEndEventName, function() {
            nextPage.off(animationEndEventName);
            self._settings.endNextPage = true;
            if (self._settings.endCurrentPage) {
                self.onEndAnimation(currentPage, nextPage, callback);
            }
        });
    };

    Pages.prototype.onEndAnimation = function (currentPage, nextPage, callback) {
        // restore default variable
        this._settings.endCurrentPage = false;
        this._settings.endNextPage = false;
        this._settings.animationStart = false;

        // restore page class
        currentPage.attr('class', this._settings.currentClassList).find('.page-overlay').remove();
        nextPage.attr('class', this._settings.nextClassList).find('.page-overlay').remove();

        // вызываем колбек фукнцию, если она есть
        if (callback !== undefined && typeof callback === 'function') {
            callback();
        }
    };

    return Pages;
});