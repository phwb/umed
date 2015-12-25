/* global define, _, $ */
define([
    'backbone',
    'app/helper/notify',
    'store',
    'collections/cities',
    'models/region'
], function (
    Backbone,
    notify,
    Store,
    Cities,
    Region
) {
    'use strict';

    var Regions = Backbone.Collection.extend({
        model: Region,
        localStorage: new Store('regions'),
        getSelected: function () {
            return this.find({selected: true});
        },
        save: function (callback, model) {
            callback = callback || function () {};
            model = model || this.first();

            model.save(null, {
                success: function (model) {
                    var current = this.indexOf(model),
                        next = current + 1;
                    if (next === this.length) {
                        this.trigger('save:success');
                        callback();
                        return null;
                    }
                    this.save(callback, this.at(next));
                }.bind(this),
                error: function () {
                    this.trigger('save:error');
                    notify.alert('Что то пошло не так при сохранении модели!');
                }
            });
        }
    });

    return new Regions();
});