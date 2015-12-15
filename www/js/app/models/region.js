/* global define, _ */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';
    // Region
    return Backbone.Model.extend({
        defaults: {
            id: 0,
            name: 'Югория-мед',
            selected: false
        }
    });
});