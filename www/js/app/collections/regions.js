/* global define, _, $ */
define([
    'backbone',
    'store',
    'collections/cities',
    'models/region'
], function (
    Backbone,
    Store,
    Cities,
    Region
) {
    'use strict';

    var Regions = Backbone.Collection.extend({
        model: Region,
        localStorage: new Store('regions')
    });

    return new Regions();
});