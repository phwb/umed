/* global define, $, _ */
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
        var splash = (function () {
            var self = $('#splash'),
                loader = self.find('.splash-loader'),
                message = $('<div class="splash-message" />'),
                progress = $('<div class="splash-progress"><div class="splash-progress__status"></div></div>');

            loader.append(message).append(progress);

            return {
                self: self,
                message: message,
                progress: progress.find('.splash-progress__status')
            };
        } ());

        splash.self.removeClass('loading');
        splash.message.text('Загрузка городов и регионов...');

        $.ajax({
            url: 'http://u-med.ru/local/api/regions/',
            dataType: 'json'
        })
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
                     *
                     * @property {Number} city.ID
                     * @property {String} city.NAME
                     */
                    cities.each(function (city) {
                        Cities.create({
                            id: city.ID,
                            name: city.NAME,
                            region: item.ID
                        }, {silent: true});
                    });
                });

                // устанавливаем по умолчанию первый активный регион и город
                var region, city;
                region = Regions.first();
                region.set({selected: true}, {silent: true}).save();

                city = Cities.find({region: region.get('id')});
                city.set({selected: true},  {silent: true}).save();

                var promises = $.when(),
                    total = Cities.length,
                    start = 1;

                splash.message.text('Загрузка офисов...');
                Cities.each(function (city) {
                    var id = city.get('id');

                    promises = promises.then(function () {
                        return $.ajax({
                            url: 'http://u-med.ru/local/api/city/' + id + '/offices/',
                            dataType: 'json'
                        });
                    }).then(function (data) {
                        var offices = _(data),
                            pos = start / total * 100;

                        start += 1;
                        splash.progress.width(pos + '%');

                        if (!offices.isArray()) {
                            return this;
                        }

                        offices.each(function (item) {
                            var params = _.extend({city: id}, item);
                            Offices.create(params, {silent: true});
                        }, this);
                    });
                });

                return promises;
            })
            .then(function () {
                var promises = $.when(),
                    total = Cities.length,
                    start = 1;

                splash.message.text('Загрузка больниц...');
                Cities.each(function (city) {
                    var id = city.get('id');

                    promises = promises.then(function () {
                        return $.ajax({
                            url: 'http://u-med.ru/local/api/city/' + id + '/hospitals/',
                            dataType: 'json'
                        });
                    }).then(function (data) {
                        var offices = _(data),
                            pos = start / total * 100;

                        start += 1;
                        splash.progress.width(pos + '%');

                        if (!offices.isArray()) {
                            return this;
                        }

                        offices.each(function (item) {
                            var params = _.extend({city: id}, item);
                            Hospitals.create(params, {silent: true});
                        }, this);
                    });
                });

                return promises;
            })
            .then(function () {
                splash.self.remove();
                // создадим новую дату обновления
                expireDate = new Date(now + period);
                // и запищем в хранилице
                ls.setItem('expire', +expireDate + '');
            })
            .fail(function () {
                splash.self.remove();
                notify.alert('Ошибка интернет соединения!');
            });
    }

    // 1450856084382
    function checkResources() {
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
                    $('#splash').remove();
                    return false;
                }
            });
            return true;
        }

        $('#splash').remove();
        return false;
    }

    return checkResources;
});
