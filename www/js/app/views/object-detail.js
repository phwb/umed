/* global define, _ */
define([
    'backbone',
    // генерация и шаблоны страниц
    'views/page',
    'text!templates/offices/detail.html',
    'text!templates/offices/detail-item.html'
], function (
    Backbone,
    // генерация и шаблоны страниц
    PageView,
    detailPage,
    template
) {
    "use strict";

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
        var model = params.model || false,
            callback = params.callback || function () {},
            cid;

        if (!model) {
            return callback('Не передана модель (model)');
        }
        cid = model.cid;

        if (!detail[cid]) {
            var pageParams, page;

            pageParams = {
                html: detailPage,
                Navbar: {
                    title: model.get('name')
                },
                Page: {
                    init: function () {
                        this.$content = this.$('.page-content');
                    },
                    render: function () {
                        var view = new Detail({model: model});
                        this.$content.html( view.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    events: {
                        'click .button': 'showOfficeOnMap'
                    },
                    showOfficeOnMap: function () {
                        Backbone.Events.trigger('map', model);
                    },
                    show: false
                }
            };
            // если у объекта есть координаты по покажем кнопку "на карте"
            if (model.get('coords')) {
                pageParams.Toolbar.show = true;
            }

            page = new PageView(pageParams);
            detail[cid] = page.init();
        }

        return callback(undefined, detail[cid]);
    };
});