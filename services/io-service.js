module.exports = IOService;

function IOService($config, $logger, $event, $socketIOConnection, $hubService) {
    $event.listen("centery-device.*", function(event, deviceIO) {
        $logger.debug("on centery device event: " + event, deviceIO);
        switch (event) {
            case "centery-device.connect":
                {
                    $socketIOConnection.broadcastMessage("switch.connect", deviceIO.serialize());
                    break;
                }
            case "centery-device.disconnect":
                {
                    $socketIOConnection.broadcastMessage("switch.disconnect", deviceIO.serialize());
                    break;
                }
            case "centery-device.remove":
                {
                    $socketIOConnection.broadcastMessage("switch.remove", deviceIO.serialize());
                    break;
                }
            case "centery-device.update":
                {
                    $socketIOConnection.broadcastMessage("switch.update", deviceIO.serialize());
                    break;
                }
            default:
                {

                }
        }
    });
    $event.listen("connection.socketio.*", function(event, session) {
        $logger.debug("on socketio connection event: " + event);
        switch (event) {
            case "connection.socketio.connection":
                {
                    var payloadData = $hubService.findSerilizedSwitches();
                    if (session.socket != null) {
                        session.socket.emit("switch.list", payloadData);
                    }
                    break;
                }
            default:
                {

                }

        }
    });
}
