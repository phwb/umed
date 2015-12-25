/* global define, $, _ */
define([
    'backbone',
    'collections/hospitals',
    'views/page',
    'text!templates/hospitals/detail.html',
    'text!templates/hospitals/detail-item.html'
], function (
    Backbone,
    // коллекции
    Hospitals,
    // генерация и шаблоны страниц
    PageView,
    detailPage,
    template
) {
    'use strict';

    var Detail = Backbone.View.extend({
        className: 'page__content',
        template: _.template(template),
        render: function () {
            var data = this.model.toJSON();

            this.$el.html( this.template( data ) );
            return this;
        }
    });

    var detail = {};
    return function (params) {
        var id = params.id || false,
            callback = params.callback || $.noop;

        if (!id) {
            callback('Не известный идентификатор офиса');
            return this;
        }

        var office = Hospitals.get(id);
        if (!office) {
            callback('Офис не найден');
            return this;
        }

        if (!detail[id]) {
            var page = new PageView({
                html: detailPage,
                Navbar: {
                    title: office.get('name')
                },
                Page: {
                    init: function () {
                        this.$content = this.$('.page-content');
                    },
                    render: function () {
                        var view = new Detail({model: office});
                        this.$content.html( view.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    show: false
                }
            });

            detail[id] = page.init();
        }

        return callback(null, detail[id]);
    };
});
