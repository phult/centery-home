global.__dir = __dirname;
global.__process = process;
var quicksort = require(__dir + "/core/app/start");
quicksort.start();
