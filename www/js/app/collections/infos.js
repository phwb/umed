/* global define */
define([
    'backbone',
    'store',
    'models/info'
], function (
    Backbone,
    Store,
    Info
) {
    'use strict';

    var Infos = Backbone.Collection.extend({
        model: Info,
        localStorage: new Store('infos')
    });

    return new Infos();
});