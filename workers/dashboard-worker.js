module.exports = DasboardWorker;
var util = require(__dir + "/utils/util");
var io = require('socket.io-client');

function DasboardWorker($config, $logger, $event, $hubService) {
    var self = this;
    var socket = null;
    function init() {
        self.connect();
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
    this.disconnect = function() {
        if (socket != null) {
            socket.disconnect();
        }
    }
    this.connect = function() {
        self.disconnect();
        var dashboardHost = util.getSetting("dashboard-host", "localhost");
        var dashboardPort = util.getSetting("dashboard-port", "8888");
        var apiKey = util.getSetting("apiKey", "");
        var room = util.getSetting("room", "");
        socket = io.connect("http://" + dashboardHost + ":" + dashboardPort, {
            query:
            "extra=ctr_type,ctr_apiKey,ctr_room" +
            "&ctr_type=room" +
            "&ctr_apiKey=" + apiKey +
            "&ctr_room=" + room + " - ID:" + util.randomNumber(4)
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
        socket.on("list-switches", listSwitches);
    }

    function onConnection(type) {
        $logger.debug("On dashboard connection: " + type);
    }

    function onMessage(message) {
        //var message = JSON.parse(message);
        $logger.debug("on dashboard message", message);
        switch (message.type) {
            case "dashboard-switch": {
                var hubAddress = message.hubAddress;
                var switchAddress = message.address == null ? -1 : message.address;
                var state = message.state;
                $hubService.switch(hubAddress, switchAddress, state);
                break;
            }
            default: {

            }
        }
    }
    function listSwitches(message) {
        var switches = $hubService.findSerilizedSwitches();
        sendMessage("switch.list", switches);
    }
    function sendMessage(event, data) {
        $logger.debug("sendMessage", event);
        socket.emit(event, data);
    }
    init();
}
