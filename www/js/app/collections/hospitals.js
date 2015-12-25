/* global define */
define([
    'backbone',
    'store',
    'models/hospital'
], function (
    Backbone,
    Store,
    Hospital
) {
    'use strict';

    var Hospitals = Backbone.Collection.extend({
        model: Hospital,
        localStorage: new Store('hospitals')
    });

    return new Hospitals();
});