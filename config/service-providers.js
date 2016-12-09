var config = require(__dir + "/core/app/config");
var routerLoader = require(__dir + "/core/loader/route-loader");
var event = require(__dir + "/core/app/event");
var logger = (require(__dir + "/core/log/logger-factory")).getLogger();
var socketIOConnection = require(__dir + "/core/net/socket-io-connection");
var HubService = require(__dir + "/services/hub-service");
var IOService = require(__dir + "/services/io-service");
var hubService = new HubService(config, logger, event);
var ioService = new IOService(config, logger, event, socketIOConnection, hubService);
module.exports = function ($serviceContainer) {
    $serviceContainer.bind("$config", config);
    $serviceContainer.bind("$route", routerLoader);
    $serviceContainer.bind("$event", event);
    $serviceContainer.bind("$logger", logger);
    $serviceContainer.bind("$hubService", hubService);
    $serviceContainer.bind("$ioService", ioService);
    $serviceContainer.bind("$socketIOConnection", socketIOConnection);
};
