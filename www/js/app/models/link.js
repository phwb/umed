/* global define, _ */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';
    // Link
    return Backbone.Model.extend({
        defaults: {
            id: 0,
            name: '',
            link: ''
        }
    });
});
