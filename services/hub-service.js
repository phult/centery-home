module.exports = HubService;
var BluetoothConnection = require(__dir + "/utils/bluetooth-connection");
function HubService($config, $logger, $event) {
    var self = this;
    this.__proto__ = new BluetoothConnection($config, $logger, $event);
    this.init = function() {
        self.__proto__.init();
    }
    this.switch = function(hubAddress, switchAddress, state) {
        //TODO: process with switchAddress
        self.setState(hubAddress, state);
    }
    this.init();
}
