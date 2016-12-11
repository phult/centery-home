module.exports = DasboardWorker;
var util = require(__dir + "/utils/util");
var io = require('socket.io-client');

function DasboardWorker($config, $event, $logger, $hubService) {
    var self = this;
    var dashboardHost = util.getSetting("dashboard-host", "localhost");
    var dashboardPort = util.getSetting("dashboard-port", "8888");
    var apiKey = util.getSetting("apiKey", "");
    var node = util.getSetting("node", "");
    var switches = $hubService.findSerilizedSwitches();
    var socket = null;
    function init() {
        socket = io.connect("http://" + dashboardHost + ":" + dashboardPort, {
            apiKey: apiKey,
            type: "centery-home",
            node: node,
            switches: switches
        });
        socket.on("connect", function(){
            onConnection("connect");
        });
        socket.on("connect_error", function(){
            onConnection("connect_error");
        });
        socket.on("reconnect_failed", function(){
            onConnection("reconnect_failed");
        });
        socket.on("reconnect", function(){
            onConnection("reconnect");
        });
        socket.on("message", onMessage);

        $event.listen("centery-device.*", function(event, deviceIO) {
            switch (event) {
                case "centery-device.connect":
                    {
                        sendMessage("switch.connect", deviceIO.serialize());
                        break;
                    }
                case "centery-device.disconnect":
                    {
                        sendMessage("switch.disconnect", deviceIO.serialize());
                        break;
                    }
                case "centery-device.remove":
                    {
                        sendMessage("switch.remove", deviceIO.serialize());
                        break;
                    }
                case "centery-device.update":
                    {
                        sendMessage("switch.update", deviceIO.serialize());
                        break;
                    }
                default:
                    {

                    }
            }
        });
    }

    function onConnection(type) {
        $logger.debug("On dashboard connection: " + type);
    }

    function onMessage(message) {
        var message = JSON.parse(message);
        switch (message.type) {
            case "": {
                break;
            }
            default: {

            }
        }
    }
    function sendMessage(event, data) {
        $logger.debug("sendMessage", event);
        socket.emit(event, data);
    }
    init();
}
