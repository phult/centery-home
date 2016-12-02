module.exports = SettingController;

var fs = require("fs");
var packageCfg = require(__dir + "/package.json");
var datetimeUtil = require(__dir + "/utils/datetime-util");
var networkUtil = require(__dir + "/utils/network-util");

function SettingController($config, $event, $logger, $hubService) {
    var self = this;
    var localIP = networkUtil.getLocalIP();
    this.index = function(io) {
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
    this.save = function(io) {
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
