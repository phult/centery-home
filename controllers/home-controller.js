module.exports = HomeController;

var fs = require("fs");
var packageCfg = require(__dir + "/package.json");
var datetimeUtil = require(__dir + "/utils/datetime-util");
var networkUtil = require(__dir + "/utils/network-util");

function HomeController($config, $event, $logger, $hubService) {
    var self = this;
    var localIP = networkUtil.getLocalIP();
    this.index = function(io) {
        var title = $config.get("app.name");
        io.render("home", {
            title: title,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307")
        });
    };
    this.setting = function(io) {
        var title = $config.get("app.name");
        var configs = readSettingFile();
        io.render("setting", {
            title: title,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307"),
            configs: configs
        });
    };
    this.saveSetting = function(io) {
        var configs = readSettingFile();
        for (var i = 0; i < configs.length; i++) {
            if (configs[i].name == io.inputs.name) {
                if (configs[i].type == "password") {
                    configs[i].value = io.inputs.value.hashHex();
                } else {
                    configs[i].value = io.inputs.value;
                }
                break;
            }
        }
        writeSettingFile(configs);
        io.json({
            status: "ok"
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
    function readSettingFile() {
        var retval = [];
        try {
            var fileData = fs.readFileSync($config.get("app.centerySettingFilePath"), "utf8");
            retval = JSON.parse(fileData == null || fileData == "" ? "[]" : fileData);
        } catch (err) {
            $logger.error("err", err);
        }
        return retval;
    }
    function writeSettingFile(configs) {
        fs.writeFile($config.get("app.centerySettingFilePath"), JSON.stringify(configs), "utf8");
    }
}
