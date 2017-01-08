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
        io.delegate("SettingController@index");
    };
    this.switchMonitor = function(io) {
        var room = util.getSetting("room", "Unknown");
        var title = $config.get("app.name");
        io.render("switch", {
            title: title,
            room: room,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307")
        });
    };
    this.hubManagement = function(io) {
        var room = util.getSetting("room", "Unknown");
        var title = $config.get("app.name");
        var hubs = [];
        var deviceLog = $hubService.readConnectedDeviceLog();
        for (var hubAddress in deviceLog) {
            hubs.push({
                address: hubAddress,
                name: deviceLog[hubAddress].name,
                switches: Object.keys(deviceLog[hubAddress].switches).length,
                state: $hubService.getDeviceIOByAddress(hubAddress) == null ? 0 : 1
            });
        }
        io.render("hub", {
            title: title,
            room: room,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307"),
            hubs: hubs
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
        var hubAddress = io.inputs.address;
        var name = io.inputs.name;
        $hubService.renameHub(hubAddress, name);
        io.json({
            "status": "ok"
        });
    };
    this.renameSwitch = function(io) {
        var hubAddress = io.inputs.hubAddress;
        var switchAddress = io.inputs.address;
        var name = io.inputs.name;
        $hubService.renameSwitch(hubAddress, switchAddress, name);
        io.json({
            "status": "ok"
        });
    };
    this.removeHub = function(io) {
        var hubAddress = io.inputs.address;
        $hubService.remove(hubAddress);
        io.json({
            "status": "ok"
        });
    };
    this.removeSwitch = function(io) {
        io.json({
            "status": "na"
        });
    };
    this.closeHub = function(io) {
        var hubAddress = io.inputs.address;
        $hubService.close(hubAddress);
        io.json({
            "status": "ok"
        });
    };
    this.sendHubMessage = function(io) {
        var hubAddress = io.inputs.address;
        var message = io.inputs.message;
        $hubService.write(hubAddress, message);
        io.json({
            "status": "ok"
        });
    }
    this.switchHub = function(io) {
        var hubAddress = io.inputs.address;
        var state = io.inputs.state;
        $hubService.switchHub(hubAddress, -1, state);
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
        var result = [];
        var deviceLog = $hubService.readConnectedDeviceLog();
        for (var hubAddress in deviceLog) {
            result.push({
                address: hubAddress,
                name: deviceLog[hubAddress].name,
                switches: Object.keys(deviceLog[hubAddress].switches).length,
                state: $hubService.getDeviceIOByAddress(hubAddress) == null ? 0 : 1
            });
        }
        io.json({
            "status": "ok",
            "result": result
        });
    };
}
