/* global define, $, _, window */
define([
    'app/helper/notify',
    // коллекции
    'collections/regions',
    'collections/cities',
    'collections/offices',
    'collections/hospitals'
], function (
    notify,
    // коллекции
    Regions,
    Cities,
    Offices,
    Hospitals
) {
    'use strict';

    var ls = window.localStorage,
        period = 60 * 60 * 24 * 30 * 1000, // секунды + минуты + часы + сутки
        expireDate, now = +(new Date());

    function downloadResources() {
        var splash = $('#splash');

        //ls.clear();
        $.ajax({
            url: 'http://u-med.ru/local/api/regions/',
            dataType: 'json'
        })
            // города и регионы
            .then(function (data) {
                var regions = _(data);
                if (regions.isArray() === false) {
                    return false;
                }

                /**
                 * добавляем регионы в коллекцию
                 *
                 * @property {Number} item.ID
                 * @property {String} item.NAME
                 * @property {Array} item.CITIES
                 */
                regions.each(function (item) {
                    Regions.create({
                        id: item.ID,
                        name: item.NAME
                    }, {silent: true});

                    var cities = _(item.CITIES);
                    if (cities.isArray() === false) {
                        return this;
                    }

                    /**
                     * добавляем города в коллекцию
                     * @params {object} city
                     * @property {Number} city.ID
                     * @property {String} city.NAME
                     * @property {String} city.MAP
                     */
                    cities.each(function (city) {
                        Cities.create({
                            id: city.ID,
                            name: city.NAME,
                            region: item.ID,
                            map: city.MAP || false
                        }, {silent: true});
                    });
                });

                // устанавливаем по умолчанию первый активный регион и город
                var region, city;
                region = Regions.first();
                region.set({selected: true}, {silent: true}).save();

                city = Cities.find({region: region.get('id')});
                city.set({selected: true},  {silent: true}).save();

                return this;
            })
            // офисы
            .then(function () {
                var citiesID = Cities.map(function (item) {
                    return item.get('id');
                });
                if (!citiesID.length) {
                    return false;
                }
                return $.ajax({
                    url: 'http://u-med.ru/local/api/offices/',
                    data: {
                        cities: citiesID
                    },
                    dataType: 'json'
                });
            })
            .then(function (data) {
                var result = _(data);

                if (result.isEmpty()) {
                    return false;
                }

                result.each(function (offices, key) {
                    _(offices).each(function (item) {
                        var params = _.extend({city: key}, item);
                        Offices.create(params, {silent: true});
                    }, this);
                });

                return this;
            })
            // больницы
            .then(function () {
                var citiesID = Cities.map(function (item) {
                    return item.get('id');
                });
                if (!citiesID.length) {
                    return false;
                }
                return $.ajax({
                    url: 'http://u-med.ru/local/api/hospitals/',
                    data: {
                        cities: citiesID
                    },
                    dataType: 'json'
                });
            })
            .then(function (data) {
                var result = _(data);

                if (result.isEmpty()) {
                    return false;
                }

                result.each(function (offices, key) {
                    _(offices).each(function (item) {
                        var params = _.extend({city: key}, item);
                        Hospitals.create(params, {silent: true});
                    }, this);
                });

                return this;
            })
            .then(function () {
                splash.remove();
                // создадим новую дату обновления и запищем в хранилице
                expireDate = new Date(now + period);
                ls.setItem('expire', +expireDate + '');
            })
            .fail(function () {
                splash.remove();
                notify.alert('Ошибка интернет соединения!');
            });
    }

    function checkResources() {
        var splash = $('#splash');

        // читаем дату из хранилица
        expireDate = +ls.getItem('expire');
        if (!expireDate) {
            // если ее нет, то сразу грузим ресурсы
            downloadResources();
            return true;
        } else if (now > expireDate) {
            notify.confirm({
                message: 'Данные могли устареть, обновить информацию?',
                buttons: ['Отмена', 'Обновить'],
                callback: function (index) {
                    if (index > 1 || index === true) {
                        downloadResources();
                        return true;
                    }
                    splash.remove();
                    return false;
                }
            });
            return true;
        }

        splash.remove();
        return false;
    }

    return checkResources;
});
