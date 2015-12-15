/* global define */
define([
    'backbone',
    'views/page'
], function (
    Backbone,
    PageView
) {
    'use strict';

    /* --- Page view --- */
    var pageView = new PageView({
        Navbar: {
            title: 'Больницы'
        }
    });

    return pageView.init();
});