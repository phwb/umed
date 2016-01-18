/* global require, $, _, window, StatusBar */
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

(function (w) {
    "use strict";

    var ready = w.ready;

    function loadComplete() {
        console.log('after device ready');
    }

    if (ready.state) {
        require(['load'], loadComplete);
    } else {
        document.addEventListener(ready.eventName, function () {
            require(['load'], loadComplete);
        });
    }
} (window));
