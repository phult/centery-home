centeryApp.controller('HubController', function ($scope, $rootScope, $http, $window, $timeout, io) {
    var self = this;
    $scope.hubs = hubs;
    this.__proto__ = new BaseController($scope, $rootScope, $http, io);
    this.initialize = function () {
        this.__proto__.initialize();
        io.on('hub.connect', function (data) {
            $scope.$apply(function () {
                var existedHub = $scope.getItem($scope.hubs, "address", data.address);
                if (existedHub == null) {
                    $scope.hubs.push(data);
                } else {
                    for (var i = $scope.hubs.length - 1; i >= 0; i--) {
                        if ($scope.hubs[i].address == data.address) {
                            $scope.hubs[i] = data;
                            break;
                        }
                    }
                }
            });
        });
        io.on('hub.disconnect', function (data) {
            $scope.$apply(function () {
                for (var i = $scope.hubs.length - 1; i >= 0; i--) {
                    if ($scope.hubs[i].address == data.address) {
                        $scope.hubs.splice(i, 1);
                        break;
                    }
                }
            });
        });
        io.on('hub.remove', function (data) {
            $scope.$apply(function () {
                for (var i = $scope.hubs.length - 1; i >= 0; i--) {
                    if ($scope.hubs[i].address == data.address) {
                        $scope.hubs.splice(i, 1);
                        break;
                    }
                }
            });
        });
        io.on('hub.update', function (data) {
            $scope.$apply(function () {
                for (var i = $scope.hubs.length - 1; i >= 0; i--) {
                    if ($scope.hubs[i].address == data.address) {
                        $scope.hubs[i] = data;
                        break;
                    }
                }
            });
        });
    };
    this.listHubs = function() {
        $http.get("/hub").success(function (data) {
            if (data.status == "ok") {
                $scope.$apply(function () {
                    $scope.hubs = data.result;
                });
            }
        }).error(function () {
        });
    };
    $scope.remove = function(hub) {
        if (!confirm("Do you want to remove the hub: " + hub.name + " ["+ hub.address +"] ?")) {
            return;
        }
        $http.post("/remove-hub", {
            address: hub.address
        }).success(function (data) {

        }).error(function () {
        });
    };
    $scope.rename = function(hub) {
        $scope.onRenaming = true;
        hub.currentName = hub.name;
        $scope.selectedHub = hub;
        $timeout(function() {
            $window.document.getElementById("hub-name").focus();
        }, 500);
    };
    $scope.cancelRename = function() {
        $scope.onRenaming = false;
        $scope.selectedHub.name = $scope.selectedHub.currentName;
    };
    $scope.saveName = function() {
        $scope.onRenaming = false;
        $scope.selectedHub.name = $scope.selectedHub.currentName;
        $http.post("/rename-hub", {
            address: $scope.selectedHub.address,
            name: $scope.selectedHub.name
        }).success(function (data) {

        }).error(function () {
        });
    };
    this.initialize();
});
