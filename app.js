process.on('SIGHUP', function() {
    log.message.info( "[%s] Asterisk process hung up.", that.callerid );
    that.exitWhenReady( true );
}).on('exit', function() {
    process.kill( process.pid, 'SIGTERM');
});
global.__dir = __dirname;
var quicksort = require(__dir + "/core/app/start");
quicksort.start();
