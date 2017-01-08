module.exports = function ($route, $logger) {
    /** Home Controller **/
    $route.get("/", "HomeController@index", {
        before: ["auth"]
    });
    $route.get("/switch-monitor", "HomeController@switchMonitor", {
        before: ["auth"]
    });
    $route.get("/hub-management", "HomeController@hubManagement", {
        before: ["auth"]
    });
    $route.get("/device", "HomeController@scan", {
        before: ["auth"]
    });
    $route.get("/hub", "HomeController@listHubs", {
        before: ["auth"]
    });
    $route.post("/hub", "HomeController@connectHub", {
        before: ["auth"]
    });
    //TODO: change to UPDATE method
    $route.post("/switch-hub", "HomeController@switchHub", {
        before: ["auth"]
    });
    $route.post("/switch", "HomeController@switch", {
        before: ["auth"]
    });
    //TODO: change to DELETE method
    $route.post("/remove-hub", "HomeController@removeHub", {
        before: ["auth"]
    });
    $route.post("/remove-switch", "HomeController@removeSwitch", {
        before: ["auth"]
    });
    $route.post("/close-hub", "HomeController@closeHub", {
        before: ["auth"]
    });
    $route.post("/message-hub", "HomeController@sendHubMessage", {
        before: ["auth"]
    });
    $route.post("/rename-hub", "HomeController@renameHub", {
        before: ["auth"]
    });
    $route.post("/rename-switch", "HomeController@renameSwitch", {
        before: ["auth"]
    });
    /** Setting Controller **/
    $route.get("/setting", "SettingController@index", {
        before: ["auth"]
    });
    $route.post("/setting", "SettingController@save", {
        before: ["auth"]
    });
    /** User Controller **/
    $route.any("/login", "UserController@login");
    $route.get("/logout", "UserController@logout", {
        before: ["auth"]
    });

    /** Filters **/
    $route.filter("auth", function (io) {
        if (io.session.get("user") == null) {
            io.redirect("/login");
            return false;
        }
    });
};
