/* global define */
define([
    'backbone',
    'store',
    'models/office'
], function (
    Backbone,
    Store,
    Office
) {
    'use strict';

    var Offices = Backbone.Collection.extend({
        model: Office,
        localStorage: new Store('offices')
    });

    return new Offices();
});