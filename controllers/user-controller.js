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
            if (login(io, io.inputs["username"], io.inputs["password"])) {
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
    function login(io, username, password) {
        var retval = false;
        password = password.hashHex();
        var passwordSetting = util.getSetting("password");
        if (password == passwordSetting) {
            setUserSession(io, {
                username: username
            });
            retval = true;
        }
        return retval;
    }
    function setUserSession(io, user) {
        io.session.set("user", user);
    }
    function destroyUserSession(io) {
        io.session.remove("user");
    }
}
