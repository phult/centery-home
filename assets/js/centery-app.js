var centeryApp = angular.module('centeryApp', []);

centeryApp.factory('io', function ($rootScope) {
    var socket = io("http://" + host + ":" + port);
    return socket;
});
