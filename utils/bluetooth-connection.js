module.exports = BluetoothConnection;

function BluetoothConnection($config, $logger, $event) {
    var self = this;
    var fs = require("fs");
    var deviceIOs = [];
    var inBackgroundTask = false;
    this.keepAliveMessage = "[alive]";
    this.init = function(args) {
        if (args.keepAliveMessage != null){
            self.keepAliveMessage = args.keepAliveMessage;
        }
        setInterval(function() {
            self.runBackGroundTask(self.keepAliveDevices);
        }, 5000);
        setInterval(function() {
            self.runBackGroundTask(self.reconnect);
        }, 10000);
        setInterval(function() {
            //self.runBackGroundTask(self.scan);
        }, 10000);
    }
    this.keepAliveDevices = function(callbackFn) {
        $logger.debug("keepAliveDevices", deviceIOs.length);
        onBackgroundTask = true;
        var disconnectedDeviceIOIdxs = [];
        if (deviceIOs.length > 0) {
            for (var i = 0; i < deviceIOs.length; i++) {
                var deviceIO = deviceIOs[i];
                deviceIO.write(self.keepAliveMessage, function(error) {
                    if (error != null) {
                        self.removeDeviceIO(deviceIO.getAddress());
                    }
                });
            }
        } else {

        }
        callbackFn();
    }
    this.runBackGroundTask = function(task) {
        if (inBackgroundTask === false) {
            inBackgroundTask = true;
            task(function() {
                inBackgroundTask = false;
            });
        }
    }
    this.reconnect = function(callbackFn) {
        var connectedDeviceLog = self.readConnectedDeviceLog();
        var requireConnect = false;
        for (var deviceAddress in connectedDeviceLog) {
            if (self.getDeviceIOByAddress(deviceAddress) == null) {
                $logger.debug("try reconnect to: " + deviceAddress + "-" + connectedDeviceLog[deviceAddress].name);
                self.connect(deviceAddress, null, function() {
                    callbackFn();
                }, function() {
                    callbackFn();
                });
                requireConnect = true;
                break;
            }
        }
        if (requireConnect === false) {
            callbackFn();
        }
    }
    this.scan = function(callbackFn) {
        var devices = [];
        var btScanner = new(require('bluetooth-serial-port')).BluetoothSerialPort();
        btScanner.on('found', function(address, name) {
            devices.push({
                'address': address,
                'name': name
            });
        });
        btScanner.on('finished', function() {
            if (callbackFn != null) {
                callbackFn(devices);
            }
            btScanner.close();
        });
        btScanner.inquire();
    }
    this.connect = function(deviceAddress, deviceName, callbackFn, errorCallbackFn) {
        // Check whether is connected
        var existedDeviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (existedDeviceIO != null) {
            callbackFn(existedDeviceIO);
            return;
        }
        // ELSE
        var btClient = new(require('bluetooth-serial-port')).BluetoothSerialPort();
        var deviceName = self.getCustomDeviceName(deviceAddress, deviceName);
        btClient.findSerialPortChannel(deviceAddress, function(channel) {
            btClient.connect(deviceAddress,
                channel,
                function() {
                    $logger.debug("Connected to: " + deviceAddress + "-" + deviceName);
                    var deviceIO = new DeviceIO(self, deviceName, btClient, $logger, $event);
                    deviceIOs.push(deviceIO);
                    if (callbackFn != null) {
                        callbackFn(deviceIO);
                    }
                },
                function(err) {
                    $logger.debug("Cannot connect to: " + deviceAddress + "-" + deviceName);
                    if (errorCallbackFn != null) {
                        errorCallbackFn(err);
                    }
                }
            );
            btClient.close();
        }, function (err) {
            $logger.debug("Cannot findSerialPortChannel " + deviceAddress + "-" + deviceName);
            errorCallbackFn(err);
        });
    }
    this.disconnect = function(deviceAddress) {
        var retval = null;
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            retval = deviceIO;
            deviceIO.close();
        }
        return retval;
    }
    this.remove = function(deviceAddress, callbackFn) {
        var deviceIO = self.disconnect(deviceAddress);
        if (deviceIO != null) {
        }
        self.removeConnectedDeviceLog(deviceAddress);
        $event.fire("centery.hub.remove", deviceIO);
        $logger.debug("Disconnect to: " + deviceIO.getAddress() + "-" + deviceIO.getName());
    }
    this.renameHub = function(deviceAddress, name) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            var currentName = deviceIO.getName();
            deviceIO.setName(name);
            self.writeConnectedDeviceLog(deviceIO);
            $event.fire("centery.hub.update", deviceIO);
            $logger.debug("Rename device: " + deviceAddress + " from '"+ currentName +"' to '" + deviceIO.getName() + "'");
        }
    }
    this.renameSwitch = function(deviceAddress, switchAddress, name) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            var currentName = deviceIO.getSwitchName(switchAddress);
            deviceIO.setSwitchName(switchAddress, name);
            self.writeConnectedDeviceLog(deviceIO);
            $event.fire("centery.switch.update", deviceIO.getSwitch(switchAddress));
            $logger.debug("Rename switch " + deviceAddress + ":" + switchAddress + " from '"+ currentName +"' to '" + deviceIO.getSwitchName(switchAddress) + "'");
        }
    }
    this.write = function(deviceAddress, msg) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            deviceIO.write(msg);
        }
    }
    this.setState = function(deviceAddress, switchAddress, state) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            deviceIO.setState(switchAddress, state);
        }
    }
    this.findDeviceIOs = function() {
        var retval = [];
        retval = deviceIOs;
        return retval;
    }
    this.getDeviceIOByAddress = function(deviceAddress) {
        var retval = null;
        for (var i = 0; i < deviceIOs.length; i++) {
            if (deviceIOs[i].getAddress() == deviceAddress) {
                retval = deviceIOs[i];
                break;
            }
        }
        return retval;
    };
    this.removeDeviceIO = function(address) {
        for (var i = 0; i < deviceIOs.length; i++) {
            if (deviceIOs[i].getAddress() == address) {
                $logger.debug("device's disconnected: ", deviceIOs[i].getAddress() + "-" + deviceIOs[i].getName())
                $event.fire("centery.hub.disconnect", deviceIOs[i]);
                deviceIOs.splice(i, 1);
                break;
            }
        }
    };
    this.getCustomSwitchName = function(address, switchAddress, defaultName) {
        var retval = (defaultName == null ? switchAddress : defaultName);
        var connectedDeviceLog = self.readConnectedDeviceLog();
        if (connectedDeviceLog[address] != null && connectedDeviceLog[address].switches[switchAddress] != null) {
            retval = connectedDeviceLog[address].switches[switchAddress].name;
        }
        return retval;
    }
    this.getCustomDeviceName = function(address, defaultName) {
        var retval = (defaultName == null ? address : defaultName);
        var connectedDeviceLog = self.readConnectedDeviceLog();
        if (connectedDeviceLog[address] != null) {
            retval = connectedDeviceLog[address].name;
        }
        return retval;
    }
    this.writeConnectedDeviceLog = function(deviceIO) {
        var connectedDeviceLog = self.readConnectedDeviceLog();
        connectedDeviceLog[deviceIO.getAddress()] = {
            name: deviceIO.getName(),
            switches: deviceIO.switches,
        };
        fs.writeFile($config.get("app.connectedDevicesFilePath"), JSON.stringify(connectedDeviceLog), 'utf8');
    }
    this.removeConnectedDeviceLog = function(deviceAddress) {
        var connectedDeviceLog = self.readConnectedDeviceLog();
        delete connectedDeviceLog[deviceAddress]
        fs.writeFile($config.get("app.connectedDevicesFilePath"), JSON.stringify(connectedDeviceLog), 'utf8');
    }
    this.readConnectedDeviceLog = function() {
        var retval = {};
        try {
            var fileData = fs.readFileSync($config.get("app.connectedDevicesFilePath"), "utf8");
            retval = JSON.parse(fileData == null || fileData == "" ? "{}" : fileData);
        } catch (err) {}
        return retval;
    }
}

function DeviceIO(bluetoothConnection, name, btSerial, $logger, $event) {
    var self = this;
    this.bluetoothConnection = bluetoothConnection;
    this.btSerial = btSerial;
    this.readers = [];
    this.state = -1;
    this.switches = {};
    var isInitialized = false;
    var receiveDataBuffer = "";
    this.init = function() {
        self.setName(name);
        self.btSerial.on('data', function(buffer) {
            var receiveData = buffer.toString('utf-8');
            if (receiveData != "\r" && receiveData != "\n" && receiveData != "\r\n" && receiveData != "\n\r") {
                receiveData = receiveData.split('\r').join('');
                receiveData = receiveData.split('\n').join('');
                receiveDataBuffer += receiveData;
                console.log("receiveData", receiveData);
                if (receiveData.charAt(receiveData.length - 1) == "]") {
                    console.log("receiveDataBuffer", receiveDataBuffer);
                    var receiveDataObj = JSON.parse(receiveDataBuffer);
                    receiveDataBuffer = "";
                    for (var i = 0; i < receiveDataObj.length; i++) {
                        self.switches[receiveDataObj[i].id] = {
                            name: bluetoothConnection.getCustomSwitchName(self.getAddress(), receiveDataObj[i].id, receiveDataObj[i].id),
                            address: receiveDataObj[i].id,
                            hubName: self.getName(),
                            hubAddress: self.getAddress(),
                            state: receiveDataObj[i].state
                        }
                        self.setState(receiveDataObj[i].id, receiveDataObj[i].state);
                    }
                    if (!isInitialized) {
                        isInitialized = true;
                        bluetoothConnection.writeConnectedDeviceLog(self);
                        $event.fire("centery.hub.connect", self);
                    }
                }
            }
        });
        self.btSerial.on('closed', function() {
            $logger.debug("btSerial is closed");
            self.bluetoothConnection.removeDeviceIO(self.getAddress());
        });
        self.btSerial.on('finished', function() {
            $logger.debug("btSerial is finished");
        });
        self.btSerial.on('failure', function() {
            $logger.debug("btSerial is failure");
            self.bluetoothConnection.removeDeviceIO(self.getAddress());
        });
    };
    this.getAddress = function() {
        return self.btSerial.address;
    };
    this.getName = function() {
        return self.btSerial.name == null ? self.btSerial.address : self.btSerial.name;
    };
    this.setName = function(name) {
        self.btSerial.name = name;
    };
    this.getSwitchName = function(switchAddress) {
        return self.switches[switchAddress].name;
    };
    this.setSwitchName = function(switchAddress, name) {
        self.switches[switchAddress].name = name;
    };
    this.getSwitch = function(switchAddress) {
        return self.switches[switchAddress];
    };
    this.getState = function(switchAddress) {
        return self.switches[switchAddress] == null ? -1 : self.switches[switchAddress].state;
    };
    this.setState = function(switchAddress, state) {
        var switchObj = self.switches[switchAddress];
        if (switchObj != null && switchObj.state != state) {
            self.write("[switch:" + switchAddress + ":" + state + "]");
            switchObj.state = state;
            $event.fire("centery.switch.update", switchObj);
        }
    };
    this.write = function(data, callbackFn) {
        console.log("write", data);
        self.btSerial.write(new Buffer(data), function(err, bytesWritten) {
            if (err) {
                $logger.debug("DeviceIO - write failure", err);
                if (callbackFn != null) {
                    callbackFn(err, bytesWritten);
                }
            }
        });
    };
    this.read = function(callbackFn) {
        readers.push(callbackFn);
    };
    this.isConnected = function() {
        return self.btSerial.isOpen();
    };
    this.close = function() {
        self.btSerial.close();
    };
    this.serialize = function() {
        var retval = [];
        for (var switchAddress in self.switches) {
            retval.push(self.switches[switchAddress]);
        }
        return retval;
    };
    this.init();
}
