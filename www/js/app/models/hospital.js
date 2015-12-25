/* global define */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';
    // Hospital
    return Backbone.Model.extend({
        defaults: {
            id: 0,
            name: '',
            address: 'Адрес не указан',
            city: 0,
            props: []
        }
    });
});