function BaseController($scope, $rootScope, $http, Socket) {
    var self = this;
    this.initialize = function () {
        $scope.socket = Socket;
        Socket.on('dashboard.update', function (data) {
            $rootScope.$broadcast("dashboard.update", data);
        });
    };
    $scope.colors = ['rgb(17,137,193)', 'rgb(240,119,25)', 'rgb(188,184,186)', '#adc560', '#e7540c', '#9fcbe1', '#ccc', '#6aafd7', '#6078ae', '#b8501c'];
    $scope.getByField = function (list, fieldName, value) {
        var retVal = null;
        list.forEach(function (item) {
            if (item[fieldName] == value) {
                retVal = item;
            }
        });
        //return
        return retVal;
    };
}