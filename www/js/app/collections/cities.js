/* global define, _ */
define([
    'backbone',
    'store',
    'models/city'
], function (
    Backbone,
    Store,
    City
) {
    'use strict';

    var Cities = Backbone.Collection.extend({
        model: City,
        localStorage: new Store('cities')
    });

    return new Cities();
});
