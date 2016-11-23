module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@index");
    $route.get("/device", "HomeController@listDevices");
    $route.post("/connection", "HomeController@createConnection");
    $route.get("/connection", "HomeController@listConnections");
    $route.post("/message", "HomeController@sendMessage");
    /** Register socket.io requests **/
    /** Register filters **/
};
