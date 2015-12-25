/* global define */
define([
    'backbone'
], function (
    Backbone
) {
    'use strict';
    // Office
    return Backbone.Model.extend({
        defaults: {
            id: 0,
            name: '',
            address: 'Адрес не указан',
            city: 0,
            props: [],
            coords: {
                value: [],
                text: ''
            },
            days: {
                working: '',
                extra: false,
                weekend: ''
            },
            hours: {
                value: [],
                text: ''
            },
            lunch: {
                value: [],
                text: ''
            }
        }
    });
});