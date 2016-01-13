/* global define */
define([
    'underscore',
    'app/helper/device'
], function (
    _,
    device
) {
    'use strict';

    var isWindows = true,
        key;

    for (key in device) {
        if (device.hasOwnProperty(key)) {
            if (device[key] === true) {
                isWindows = false;
                break;
            }
        }
    }

    /**
     * notify
     *
     * @global navigator
     * @property navigator.notification
     */
    return {
        /**
         * @param parameters
         * @property {String} parameters.message
         * @property {Function} parameters.callback
         * @property {String} parameters.title
         * @property {String} parameters.button
         */
        alert: function (parameters) {
            var params = {},
                defaults = {
                    message: '',
                    callback: _.noop,
                    title: 'Внимание!',
                    button: 'ОК'
                };

            if (typeof parameters === 'string') {
                params = _.extend(defaults, {message: parameters});
            } else {
                params = _.extend(defaults, parameters);
            }

            if (isWindows) {
                alert(params.message);
            } else {
                document.addEventListener('deviceready', function () {
                    navigator.notification.alert(params.message, params.callback, params.title, params.button);
                }, false);
            }
        },
        confirm: function (parameters) {
            var params = {},
                defaults = {
                    message: '',
                    callback: function (index) {
                        return index;
                    },
                    title: 'Внимание!',
                    buttons: ['Отмена', 'ОК']
                };

            if (typeof parameters === 'string') {
                params = _.extend(defaults, {message: parameters});
            } else {
                params = _.extend(defaults, parameters);
            }

            if (isWindows) {
                params.callback(confirm(params.message));
            } else {
                document.addEventListener('deviceready', function () {
                    navigator.notification.confirm(params.message, params.callback, params.title, params.buttons);
                }, false);
            }
        }
    };
});
