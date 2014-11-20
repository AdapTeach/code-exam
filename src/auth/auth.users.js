var authVerifier = require('./auth.verifier');

var authUser = {};

var loggedIn = false;

authUser.isLoggedIn = function () {
    return loggedIn;
};

authUser.login = function () {
    authUser.loggedIn = true;
};

authUser.logout = function () {
    authUser.loggedIn = false;
};

module.exports = authUser;