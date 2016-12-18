module.exports = {
    name: "Centery",
    port: 2307,
    debug: true,
    requestTimeout: -1,
    autoload: [
        "/controllers",
        "/entities",
        "/start"
    ],
    assetPath: "/assets",
    encryption: {
        'key': "d6F3Efeq",
        'cipher': "aes-256-ctr"
    },
    connectedDevicesFilePath: __dir + "/storage/centery-devices.cef",
    centerySettingFilePath: __dir + "/config/centery.cef",
};
