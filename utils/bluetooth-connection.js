module.exports = BluetoothConnection;

function BluetoothConnection($config, $logger, $event) {
    var self = this;
    var fs = require("fs");
    var deviceIOs = [];
    var inBackgroundTask = false;
    this.keepAliveMessage = "2";
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
                deviceIO.write(self.keepAliveMessage + "\r\n", function(error) {
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
                $logger.debug("try reconnect to: " + deviceAddress + "-" + connectedDeviceLog[deviceAddress]);
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
        var deviceName = getDeviceName(deviceAddress, deviceName);
        btClient.findSerialPortChannel(deviceAddress, function(channel) {
            btClient.connect(deviceAddress,
                channel,
                function() {
                    console.log("btClient",btClient);
                    $logger.debug("Connected to: " + deviceAddress + "-" + deviceName);
                    var deviceIO = new DeviceIO(self, deviceName, btClient, $logger, $event);
                    deviceIOs.push(deviceIO);
                    self.writeConnectedDeviceLog(deviceIO);
                    $event.fire("centery-device.connect", deviceIO);
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
        removeConnectedDeviceLog(deviceAddress);
        $event.fire("centery-device.remove", deviceIO);
        $logger.debug("Disconnect to: " + deviceIO.getAddress() + "-" + deviceIO.getName());
    }
    this.rename = function(deviceAddress, name) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            var currentName = deviceIO.getName();
            deviceIO.setName(name);
            self.writeConnectedDeviceLog(deviceIO);
            $event.fire("centery-device.update", deviceIO);
            $logger.debug("Rename " + deviceAddress + " from '"+ currentName +"' to '" + deviceIO.getName()) + "'";
        }
    }
    this.write = function(deviceAddress, msg) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            deviceIO.write(msg);
        }
    }
    this.setState = function(deviceAddress, state) {
        var deviceIO = self.getDeviceIOByAddress(deviceAddress);
        if (deviceIO != null) {
            deviceIO.write(state);
            deviceIO.setState(state);
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
    }
    this.readConnectedDeviceLog = function() {
        var retval = {};
        try {
            var fileData = fs.readFileSync($config.get("app.connectedDevicesFilePath"), "utf8");
            retval = JSON.parse(fileData == null || fileData == "" ? "{}" : fileData);
        } catch (err) {}
        return retval;
    }
    this.writeConnectedDeviceLog = function(deviceIO) {
        var connectedDeviceLog = self.readConnectedDeviceLog();
        connectedDeviceLog[deviceIO.getAddress()] = deviceIO.getName();
        fs.writeFile($config.get("app.connectedDevicesFilePath"), JSON.stringify(connectedDeviceLog), 'utf8');
    }
    this.removeDeviceIO = function(address) {
        for (var i = 0; i < deviceIOs.length; i++) {
            if (deviceIOs[i].getAddress() == address) {
                $logger.debug("device's disconnected: ", deviceIOs[i].getAddress() + "-" + deviceIOs[i].getName())
                $event.fire("centery-device.disconnect", deviceIOs[i]);
                deviceIOs.splice(i, 1);
                break;
            }
        }
    }
    function removeConnectedDeviceLog(deviceAddress) {
        var connectedDeviceLog = self.readConnectedDeviceLog();
        delete connectedDeviceLog[deviceAddress]
        fs.writeFile($config.get("app.connectedDevicesFilePath"), JSON.stringify(connectedDeviceLog), 'utf8');
    }
    function getDeviceName(address, defaultName) {
        var retval = (defaultName == null ? address : defaultName);
        var connectedDeviceLog = self.readConnectedDeviceLog();
        if (connectedDeviceLog[address] != null) {
            retval = connectedDeviceLog[address];
        }
        return retval;
    }
}

function DeviceIO(bluetoothConnection, name, btSerial, $logger, $event) {
    var self = this;
    this.bluetoothConnection = bluetoothConnection;
    this.btSerial = btSerial;
    this.readers = [];
    this.state = -1;
    this.init = function() {
        self.setName(name);
        self.btSerial.on('data', function(buffer) {
            var receiveData = buffer.toString('utf-8');
            if (receiveData != "\r\n") {
                self.setState(receiveData);
                /*
                for (var i = 0; i < self.readers.length; i++) {
                    self.readers[i](buffer.toString('utf-8'));
                }
                */
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
    this.getState = function() {
        return self.state == null ? -1 : self.state;
    };
    this.setState = function(state) {
        if (self.state != state) {
            self.state = state;
            $event.fire("centery-device.update", self);
        }
    };
    this.write = function(data, callbackFn) {
        self.btSerial.write(new Buffer(data + "\r\n", "utf-8"), function(err, bytesWritten) {
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
        return {
            name: self.getName(),
            address: self.getAddress(),
            hubAddress: self.getAddress(),
            state: self.getState(),
        }
    };
    this.init();
}
