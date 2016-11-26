module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@index");
    $route.get("/device", "HomeController@scan");
    $route.get("/hub", "HomeController@listHubs");
    $route.post("/hub", "HomeController@connectHub");
    //TODO: change to UPDATE method
    $route.post("/switch-hub", "HomeController@switchHub");
    //TODO: change to DELETE method
    $route.post("/remove-hub", "HomeController@removeHub");
    $route.post("/close-hub", "HomeController@closeHub");
    $route.post("/message-hub", "HomeController@sendHubMessage");
    $route.post("/rename-hub", "HomeController@renameHub");
    /** Register socket.io requests **/
    /** Register filters **/
};
