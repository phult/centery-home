module.exports = HomeController;

function HomeController($config, $event, $logger, $bluetoothConnector) {
    var self = this;
    this.index = function(io) {
        var title = $config.get("app.name");
        io.render("dashboard", {
            title: title
        });
    }
    this.listDevices = function(io) {
        $bluetoothConnector.scan(function(devices) {
            io.echo(JSON.stringify(devices));
        });
    }
    this.listConnections = function(io) {
        $bluetoothConnector.listPairedDevices(function(pairedDevices) {
            io.echo(JSON.stringify(pairedDevices));
        })
    }
    this.createConnection = function(io) {
        var deviceAddress = io.inputs.device;
        $bluetoothConnector.connect(deviceAddress, function(deviceIO) {
            io.echo("connected");
        }, function(error) {
            io.echo("cannot connect");
        });
    }
    this.sendMessage = function(io) {
        var deviceAddress = io.inputs.device;
        var message = io.inputs.message;
        $bluetoothConnector.writeDevice(deviceAddress, message);
        io.json({
            "status": "ok"
        });
    }
}
