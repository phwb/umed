/*global define*/
define([
    'backbone',
    'store',
    'models/policy'
], function (
    Backbone,
    Store,
    Policy
) {
    'use strict';

    var Policies = Backbone.Collection.extend({
        model: Policy,
        localStorage: new Store('policies')
    });

    return new Policies();
});
