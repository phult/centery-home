module.exports = new BluetoothConnector();

function BluetoothConnector() {
    var self = this;
    var fs = require("fs");
    var deviceIOs = [];
    var CONNECTED_DEVICES_FILE_PATH = __dir + "/livit-connected-devices";
    var inBackgroundTask = false;
    setInterval(function() {
        self.runBackGroundTask(self.keepAliveDevices);
    }, 5000);
    setInterval(function() {
        self.runBackGroundTask(self.reconnect);
    }, 10000);
    setInterval(function() {
        //self.runBackGroundTask(self.scan);
    }, 10000);
    this.keepAliveDevices = function(callbackFn) {
        onBackgroundTask = true;
        var disconnectedDeviceIOIdxs = [];
        for (var i = 0; i < deviceIOs.length; i++) {
            deviceIOs[i].write("2\r\n", function(error) {
                if (error != null) {
                    //console.log("device's disconnected", deviceIOs[i].getAddress());
                    deviceIOs.splice(disconnectedDeviceIOIdxs[i], 1);
                }
            });
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
        var connectedDevices = self.readConnectedDevices();
        var requireConnect = false;
        for (var deviceAddress in connectedDevices) {
            if (self.getDeviceIO(deviceAddress) == null) {
                self.connect(deviceAddress, function() {
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
    this.connect = function(deviceAddress, callbackFn, errorCallbackFn) {
        var btClient = new(require('bluetooth-serial-port')).BluetoothSerialPort();
        btClient.findSerialPortChannel(deviceAddress, function(channel) {
            btClient.connect(deviceAddress,
                channel,
                function() {
                    console.log(deviceAddress + "'s connected!");
                    var deviceIO = new DeviceIO(btClient);
                    deviceIOs.push(deviceIO);
                    self.writeConnectedDevice(deviceAddress, deviceAddress);
                    if (callbackFn != null) {
                        callbackFn(deviceIO);
                    }
                },
                function(err) {
                    console.log(deviceAddress + " cannot connect!");
                    if (errorCallbackFn != null) {
                        errorCallbackFn(err);
                    }
                }
            );
            btClient.close();
        });
    }
    this.namedDevice = function(deviceAddress, name) {
        self.writeConnectedDevice(deviceAddress, name);
    }
    this.writeDevice = function(deviceAddress, msg) {
        var deviceIO = self.getDeviceIO(deviceAddress);
        if (deviceIO != null) {
            deviceIO.write(msg);
        }
    }
    this.getDeviceIO = function(deviceAddress) {
        var retval = null;
        for (var i = 0; i < deviceIOs.length; i++) {
            if (deviceIOs[i].getAddress() == deviceAddress) {
                retval = deviceIOs[i];
                break;
            }
        }
        return retval;
    }
    this.readConnectedDevices = function() {
        var retval = {};
        try {
            var fileData = fs.readFileSync(CONNECTED_DEVICES_FILE_PATH);
            retval = JSON.parse(fileData == null || fileData == "" ? "{}" : fileData);
        } catch (err) {}
        return retval;
    }
    this.writeConnectedDevice = function(deviceAddress, name) {
        var connectedDevices = self.readConnectedDevices();
        connectedDevices[deviceAddress] = name;
        var deviceIO = self.getDeviceIO(deviceAddress);
        if (deviceIO != null) {
            deviceIO.setName(name);
        }
        console.log("writeConnectedDevice", JSON.stringify(connectedDevices));
        fs.writeFile(CONNECTED_DEVICES_FILE_PATH, JSON.stringify(connectedDevices), 'utf8');
    }
    console.log("Connected devices:", self.readConnectedDevices());
}

function DeviceIO(btSerial) {
    var self = this;
    this.btSerial = btSerial;
    this.readers = [];
    this.btSerial.on('data', function(buffer) {
        var receiveData = buffer.toString('utf-8');
        if (receiveData != "\r\n") {
            for (var i = 0; i < self.readers.length; i++) {
                self.readers[i](buffer.toString('utf-8'));
            }
        }
    });
    this.btSerial.on('closed', function() {
        console.log("closed");
    });
    this.btSerial.on('finished', function() {
        console.log("finished");
    });
    this.btSerial.on('failure', function() {
        console.log("failure");
    });
    this.getAddress = function() {
        return self.btSerial.address;
    };
    this.getName = function() {
        return self.btSerial.name == null ? self.btSerial.address : self.btSerial.name;
    };
    this.setName = function(name) {
        self.btSerial.name = name;
    };
    this.write = function(data, callbackFn) {
        self.btSerial.write(new Buffer(data + "\r\n", "utf-8"), function(err, bytesWritten) {
            if (err) console.log(err);
            if (callbackFn != null) {
                callbackFn(err, bytesWritten);
            }
        });
    };
    this.read = function(callbackFn) {
        readers.push(callbackFn);
    };
    this.isConnected = function() {
        return self.btSerial.isOpen();
    };
}
