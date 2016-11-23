/**
 * Created by TuanPA on 3/12/2016.
 */
dashboardApp.controller('SwitchController', function ($scope, $rootScope, $http,Socket) {
    this.__proto__ = new BaseController($scope, $rootScope, $http,Socket);
    this.initialize = function () {
        this.__proto__.initialize();
    };
    $scope.$on("dashboard.update", function (event, data) {
        $scope.$apply(function () {
            if (data.summary != null) {
                $scope.summaryData.xAxis.categories = data.summary.time;
                $scope.summaryData.series[0].data = data.summary.io;
                $scope.summaryData.series[1].data = data.summary.amount;
                $scope.summaryTodayAmount = data.summary.amount[data.summary.amount.length - 1];
                $scope.summaryTodayIO = data.summary.io[data.summary.io.length - 1];
            }
        });
    });
    this.initialize();
});
