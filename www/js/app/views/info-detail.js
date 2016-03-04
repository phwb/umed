/* global define, _ */
define([
    'backbone',
    'collections/infos',
    'views/page',
    'text!templates/info/detail.html',
    'text!templates/info/detail-item.html'
], function (
    Backbone,
    Infos,
    PageView,
    detailPage,
    template
) {
    'use strict';

    var $ = Backbone.$;

    var DetailView = Backbone.View.extend({
        className: 'article-detail',
        template: _.template(template),
        render: function () {
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    var details = {};
    /**
     * @params {Object} params
     * @property {String} params.code
     * @property {Function} params.code
     */
    return function (params) {
        var id = params.id || '',
            callback = params.callback || $.noop,
            info;

        if (!id) {
            callback('Неизвестная страница');
            return this;
        }

        info = Infos.get(id);
        if (!info) {
            callback('Статья не найдена, пожалуйста обновите информацию!');
            return this;
        }

        if (!details[id]) {
            var page = new PageView({
                html: detailPage,
                Navbar: {
                    title: info.get('name')
                },
                Page: {
                    init: function () {
                        this.$page = this.$('.page-content');
                    },
                    render: function () {
                        var item = new DetailView({model: info});
                        this.$page.html( item.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    show: false
                }
            });

            details[id] = page.init();
        }

        return callback(null, details[id]);
    };
});