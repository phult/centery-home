module.exports = HomeController;

var packageCfg = require(__dir + "/package.json");
var datetimeUtil = require(__dir + "/utils/datetime-util");

function HomeController($config, $event, $logger, $hubService) {
    var self = this;
    this.index = function(io) {
        var title = $config.get("app.name");
        io.render("home", {
            title: title,
            resourceVersion: packageCfg.version,
            host: $config.get("app.host", "localhost"),
            port: $config.get("app.port", "2307")
        });
    }
    this.scan = function(io) {
        $hubService.scan(function(devices) {
            io.json({
                status: "ok",
                result: devices
            });
        });
    }
    this.connectHub = function(io) {
        var hubAddress = io.inputs.hub;
        $hubService.connect(hubAddress, function(deviceIO) {
            io.json({
                status: "ok",
                result: deviceIO
            });
        }, function(error) {
            io.json({
                status: "fail"
            });
        });
    }
    this.renameHub = function(io) {
        var hubAddress = io.inputs.hub;
        var value = io.inputs.value;
        $hubService.rename(hubAddress, value);
        io.json({
            "status": "ok"
        });
    }
    this.removeHub = function(io) {
        var hubAddress = io.inputs.hub;
        $hubService.remove(hubAddress);
        io.json({
            "status": "ok"
        });
    }
    this.closeHub = function(io) {
        var hubAddress = io.inputs.hub;
        $hubService.close(hubAddress);
        io.json({
            "status": "ok"
        });
    }
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
        var switchId = io.inputs.switchId == null ? -1 : io.inputs.switchId;
        var value = io.inputs.value;
        $hubService.switch(hubAddress, switchId, value);
        io.json({
            "status": "ok"
        });
    }
    this.listHubs = function(io) {
        io.json($hubService.readConnectedDeviceLog());
    }
}
