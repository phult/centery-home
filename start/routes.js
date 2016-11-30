module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@index");
    $route.get("/setting", "HomeController@setting");
    $route.post("/setting", "HomeController@saveSetting");
    $route.get("/device", "HomeController@scan");
    $route.get("/hub", "HomeController@listHubs");
    $route.post("/hub", "HomeController@connectHub");
    //TODO: change to UPDATE method
    $route.post("/switch-hub", "HomeController@switchHub");
    $route.post("/switch", "HomeController@switch");
    //TODO: change to DELETE method
    $route.post("/remove-hub", "HomeController@removeHub");
    $route.post("/remove-switch", "HomeController@removeSwitch");
    $route.post("/close-hub", "HomeController@closeHub");
    $route.post("/message-hub", "HomeController@sendHubMessage");
    $route.post("/rename-hub", "HomeController@renameHub");
    $route.post("/rename-switch", "HomeController@renameSwitch");
    /** Register socket.io requests **/
    /** Register filters **/
};
