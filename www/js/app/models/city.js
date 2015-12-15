/* global define, _ */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';
    // City
    return Backbone.Model.extend({
        defaults: {
            id: 0,
            name: 'Ханты-Мансийск',
            selected: false,
            region: 0
        }
    });
});
