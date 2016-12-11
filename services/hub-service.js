module.exports = HubService;
var BluetoothConnection = require(__dir + "/utils/bluetooth-connection");
function HubService($config, $logger, $event) {
    var self = this;
    this.__proto__ = new BluetoothConnection($config, $logger, $event);
    this.init = function() {
        self.__proto__.init({
            keepAliveMessage: "2"
        });
    }
    //TODO: process with switchAddress
    this.switch = function(hubAddress, switchAddress, state) {
        self.setState(hubAddress, state);
    }
    //TODO: process with switched instead of hubs
    this.findSerilizedSwitches = function() {
        var retval = [];
        var deviceIOs = self.findDeviceIOs();
        for (var i = 0; i < deviceIOs.length; i++){
            retval.push(deviceIOs[i].serialize());
        }
        return retval;
    }
    this.init();
}
