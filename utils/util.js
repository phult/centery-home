var fs = require("fs");
var config = require(__dir + "/core/app/config");
var logger = (require(__dir + "/core/log/logger-factory")).getLogger();

module.exports = {
    randomNumber: function(length) {
        var retval = "";
        if (length == null) {
            length = 8;
        }
        var possible = "0123456789";
        for (var i = 0; i < length; i++) {
            retval += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return retval;
    },
    flatArrayToObject: function(array) {
        var retval = [];
        for (var i = 0; i < array.length; i = i + 2) {
            retval.push({key: array[i], value: array[i + 1]});
        }
        return retval;
    },
    readSettingFile: function() {
        var retval = [];
        try {
            var fileData = fs.readFileSync(config.get("app.centerySettingFilePath"), "utf8");
            retval = JSON.parse(fileData == null || fileData == "" ? "[]" : fileData);
        } catch (err) {
            logger.error("err", err);
        }
        return retval;
    },
    getSetting: function(key, defaultValue) {
        var retval = defaultValue;
        try {
            var fileData = fs.readFileSync(config.get("app.centerySettingFilePath"), "utf8");
            var settings = JSON.parse(fileData == null || fileData == "" ? "[]" : fileData);
            for(var i = 0; i < settings.length; i++) {
                var setting = settings[i];
                if (setting.key == key) {
                    retval = setting.value;
                    break;
                }
            }
        } catch (err) {
            logger.error("err", err);
        }
        return retval;
    },
    writeSettingFile: function(configs) {
        fs.writeFileSync(config.get("app.centerySettingFilePath"), JSON.stringify(configs), "utf8");
    }
};
