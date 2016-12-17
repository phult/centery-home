module.exports = HomeController;

var fs = require("fs");
var packageCfg = require(__dir + "/package.json");
var datetimeUtil = require(__dir + "/utils/datetime-util");
var networkUtil = require(__dir + "/utils/network-util");
var util = require(__dir + "/utils/util");

function HomeController($config, $event, $logger, $hubService) {
    var self = this;
    var localIP = networkUtil.getLocalIP();
    this.index = function(io) {
        var room = util.getSetting("room", "Unknown");
        var title = $config.get("app.name");
        io.render("home", {
            title: title,
            room: room,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307")
        });
    };
    this.scan = function(io) {
        $hubService.scan(function(devices) {
            io.json({
                status: "ok",
                result: devices
            });
        });
    };
    this.connectHub = function(io) {
        var hubAddress = io.inputs.address;
        var hubName = io.inputs.name;
        $hubService.connect(hubAddress, hubName, function(deviceIO) {
            io.json({
                status: "ok",
                result: deviceIO
            });
        }, function(error) {
            io.json({
                status: "fail"
            });
        });
    };
    this.renameHub = function(io) {
        var hubAddress = io.inputs.hub;
        var value = io.inputs.name;
        $hubService.rename(hubAddress, name);
        io.json({
            "status": "ok"
        });
    };
    this.renameSwitch = function(io) {
        var hubAddress = io.inputs.hub;
        var switchAddress = io.inputs.switch;
        var name = io.inputs.name;
        $hubService.rename(hubAddress, name);
        io.json({
            "status": "ok"
        });
    };
    this.removeHub = function(io) {
        var hubAddress = io.inputs.hub;
        $hubService.remove(hubAddress);
        io.json({
            "status": "ok"
        });
    };
    this.removeSwitch = function(io) {
        var hubAddress = io.inputs.switch;
        $hubService.remove(hubAddress);
        io.json({
            "status": "ok"
        });
    };
    this.closeHub = function(io) {
        var hubAddress = io.inputs.hub;
        $hubService.close(hubAddress);
        io.json({
            "status": "ok"
        });
    };
    this.sendHubMessage = function(io) {
        var hubAddress = io.inputs.hub;
        var message = io.inputs.message;
        $hubService.write(hubAddress, message);
        io.json({
            "status": "ok"
        });
    }
    this.switchHub = function(io) {
        var hubAddress = io.inputs.hub;
        var state = io.inputs.state;
        $hubService.switch(hubAddress, -1, state);
        io.json({
            "status": "ok"
        });
    };
    this.switch = function(io) {
        var hubAddress = io.inputs.hub;
        var switchAddress = io.inputs.switch == null ? -1 : io.inputs.switch;
        var state = io.inputs.state;
        $hubService.switch(hubAddress, switchAddress, state);
        io.json({
            "status": "ok"
        });
    };
    this.listHubs = function(io) {
        io.json($hubService.readConnectedDeviceLog());
    };
}
