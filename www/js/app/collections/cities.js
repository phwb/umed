/* global define, _ */
define([
    'backbone',
    'app/helper/notify',
    'store',
    'models/city'
], function (
    Backbone,
    notify,
    Store,
    City
) {
    'use strict';

    var Cities = Backbone.Collection.extend({
        model: City,
        localStorage: new Store('cities'),
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

    return new Cities();
});
