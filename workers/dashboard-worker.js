module.exports = DasboardWorker;
var util = require(__dir + "/utils/util");
var io = require('socket.io-client');

function DasboardWorker($config, $event, $logger) {
    var self = this;
    var dashboardHost = util.getSetting("dashboard-host", "localhost");
    var dashboardPort = util.getSetting("dashboard-port", "8888");
    var apiKey = util.getSetting("apiKey", "");
    var socket = io.connect("http://" + dashboardHost + ":" + dashboardPort, {
        apiKey: apiKey,
        type: "centery-home"
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

    function onConnection(type) {
        $logger.debug("On connection: " + type);
    }

    function onMessage(message) {
        var message = JSON.parse(message);
    }

}
