/* global define */
define([
    'backbone',
    'store',
    'models/link'
], function (
    Backbone,
    Store,
    Link
) {
    'use strict';

    var Infos = Backbone.Collection.extend({
        model: Link,
        localStorage: new Store('links')
    });

    return new Infos();
});
