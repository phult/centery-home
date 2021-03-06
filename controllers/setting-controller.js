module.exports = SettingController;

var packageCfg = require(__dir + "/package.json");
var datetimeUtil = require(__dir + "/utils/datetime-util");
var networkUtil = require(__dir + "/utils/network-util");
var util = require(__dir + "/utils/util");

function SettingController($config, $event, $logger, $hubService, $dashboardWorker) {
    var self = this;
    var localIP = networkUtil.getLocalIP();
    this.index = function(io) {
        var title = $config.get("app.name");
        var room = util.getSetting("room", "Unknown");
        var configs = util.readSettingFile();
        io.render("setting", {
            title: title,
            room: room,
            version: packageCfg.version,
            host: localIP,
            port: $config.get("app.port", "2307"),
            configs: configs
        });
    };
    this.save = function(io) {
        var configs = util.readSettingFile();
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
        util.writeSettingFile(configs);
        $dashboardWorker.connect();
        io.json({
            status: "ok"
        });
    };
}
