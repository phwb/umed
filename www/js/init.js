/* global require, $ */
require.config({
    urlArgs: "v=" + (new Date()).getTime(),
    shim: {
        store: {
            deps: ['backbone'],
            exports: 'Store'
        },
        ymaps: {
            exports: 'ymaps'
        }
    },
    paths: {
        // сторонние библиотеки
        fastclick: 'libs/fastclick/fastclick',
        jquery: 'libs/jquery/jquery-2.1.4',
        underscore: 'libs/underscore/underscore',
        backbone: 'libs/backbone/backbone',
        store: 'libs/backbone.localstorage/backbone.localStorage',
        backboneForm: 'libs/backbone.form/backbone-forms',
        text: 'libs/require/text',
        ymaps: 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&load=Map,Placemark',
        // мои библиотеки
        page: 'libs/pages/page',
        // сокращения, чтоб постоянно не писать app
        collections: 'app/collections',
        templates: 'app/templates',
        models: 'app/models',
        views: 'app/views'
    }
});

/**
 * @params w
 * @property {function} w.open
 */
(function () {
    "use strict";

    var ready = window.ready;
    
    function loadComplete() {
        require(['load'], function () {
            $(document).on('click', 'a[target="_system"]', function (e) {
                e.preventDefault();
                window.open($(this).attr('href'), '_system');
            });
        });
    }

    if (ready.state) {
        loadComplete();
    } else {
        document.addEventListener(ready.eventName, loadComplete, false);
    }
} ());
