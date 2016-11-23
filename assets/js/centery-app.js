var centeryApp = angular.module('centeryApp', ["highcharts-ng"]);

centeryApp.factory('io', function ($rootScope) {
    var socket = io("http://" + host + ":" + port);
    return socket;
});
