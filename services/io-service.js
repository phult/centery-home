module.exports = IOService;

function IOService($config, $logger, $event, $socketIOConnection, $hubService) {
    $event.listen("centery.*", function(event, data) {
        $logger.debug("on centery device event: " + event, data);
        switch (event) {
            case "centery.hub.connect":
                {
                    $socketIOConnection.broadcastMessage("hub.connect", data.serialize());
                    var deviceIOSerializes = data.serializeSwitches();
                    for (var i = 0; i < deviceIOSerializes.length; i++) {
                        $socketIOConnection.broadcastMessage("switch.connect", deviceIOSerializes[i]);
                    }
                    break;
                }
            case "centery.hub.disconnect":
                {
                    $socketIOConnection.broadcastMessage("hub.disconnect", data.serialize());
                    var deviceIOSerializes = data.serializeSwitches();
                    for (var i = 0; i < deviceIOSerializes.length; i++) {
                        $socketIOConnection.broadcastMessage("switch.disconnect", deviceIOSerializes[i]);
                    }
                    break;
                }
            case "centery.hub.remove":
                {
                    $socketIOConnection.broadcastMessage("hub.remove", data.serialize());
                    var deviceIOSerializes = data.serializeSwitches();
                    for (var i = 0; i < deviceIOSerializes.length; i++) {
                        $socketIOConnection.broadcastMessage("switch.remove", deviceIOSerializes[i]);
                    }
                    break;
                }
            case "centery.hub.update":
                {
                    $socketIOConnection.broadcastMessage("hub.update", data.serialize());
                    break;
                }
            case "centery.switch.update":
                {
                    $socketIOConnection.broadcastMessage("switch.update", data);
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
