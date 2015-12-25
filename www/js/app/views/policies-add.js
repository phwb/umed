/*global define, _*/
/*jshint multistr: true */
define([
    'backbone',
    'backboneForm',
    'models/policy',
    'collections/policies',
    'views/page',
    'text!templates/policies/add.html'
], function (
    Backbone,
    Form,
    Policy,
    Policies,
    PageView,
    addPage
) {
    'use strict';

    /**
     * @property {object} Form.Fieldset
     * @property {object} Form.Field
     * @property {object} Form.editors
     */
    Form.Fieldset.template = _.template('<div data-fields></div>');
    Form.Field.template = _.template('\
    <div class="form-line field-<%= key %>">\
        <label class="label" for="<%= editorId %>">\
            <% if (titleHTML){ %>\
                <%= titleHTML %>\
            <% } else { %>\
                <%- title %>\
            <% } %>\
        </label>\
        <div class="form-line__controls" data-editor></div>\
    </div>\
    ');

    Form.editors.Base.prototype.className = 'input';
    Form.editors.Select.prototype.className = 'select';
    Form.Field.errorClassName = 'has-error';

    Form.editors.Date.monthNames = 'Январь Февраль Март Апрель Май Июнь Июль Август Сентябрь Октябрь Ноябрь Декабрь'.split(' ');
    Form.editors.Date.template = _.template('\
    <div>\
        <select class="select" data-type="date"><%= dates %></select>\
        <select class="select" data-type="month"><%= months %></select>\
        <select class="select" data-type="year"><%= years %></select>\
    </div>\
    ');

    var forms = {};
    return function (id, callback) {
        var policy, isNew = id === undefined;

        policy = isNew ? new Policy() : Policies.get(id);
        if (isNew) {
            id = 'new';
        }

        if (forms[id] === undefined) {
            var form = new Form({
                model: policy,
                events: {
                    submit: function (e) {
                        var errors = this.commit();

                        if (!errors) {
                            if (isNew) {
                                Policies.add(this.model);
                            }

                            // при сохранении или обновлении модели удалим закешированую форму
                            Backbone.Events.trigger('page:remove', forms[id].page.cid);
                            delete forms[id];
                        }

                        e.preventDefault();
                    }
                }
            });

            /* --- Page view --- */
            var pageView = new PageView({
                html: addPage,
                Page: {
                    render: function () {
                        this.$('#addForm').html( form.render().el );
                        return this;
                    }
                },
                Toolbar: {
                    events: {
                        'click #savePolicy': 'savePolicy'
                    },
                    savePolicy: function () {
                        form.$el.submit();
                    }
                }
            });

            forms[id] = pageView.init();
        }

        return callback(undefined, forms[id]);
    };
});
