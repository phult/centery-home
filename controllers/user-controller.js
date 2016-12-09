module.exports = UserController;
var util = require(__dir + "/utils/util");

function UserController($config, $event, $logger) {
    var self = this;
    var title = $config.get("app.name");
    this.login = function(io) {
        if (io.method == "get") {
            var user = io.session.get("user", null);
            // check if user's logged in
            if (user != null) {
                io.redirect("/");
            } else {
                io.render("login", {
                    title: title
                });
            }
        } else if (io.method == "post") {
            var inputPassword = io.inputs["password"].hashHex();
            var password = util.getSetting("password");
            if (inputPassword == password) {
                setUserSession(io);
                io.redirect("/");
            } else {
                io.render("login", {
                    title: title,
                    result: false
                });
            }
        }
    };
    this.logout = function(io) {
        destroyUserSession(io);
        io.redirect("/login");
    };
    function setUserSession(io) {
        io.session.set("user", {
            username: io.inputs.username
        });
    }
    function destroyUserSession(io) {
        io.session.remove("user");
    }
}
