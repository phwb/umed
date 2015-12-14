/*global define*/
define([
    'backbone',
    'backboneLocalStorage',
    'models/policy'
], function (Backbone, Store, Policy) {
    'use strict';

    var Policies = Backbone.Collection.extend({
        model: Policy,
        localStorage: new Store('policies')
    });

    return new Policies();
});
