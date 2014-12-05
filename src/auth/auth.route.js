var authVerifier = require('./auth.persona'),
    User = require('../user/user.model'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    httpError = require('../error/error.http');

var routes = {};

routes.publish = function (router) {

    router.post('/login', function (request, response) {
        authVerifier
            .verify(request.body.assertion)
            .then(function sendAuthData(authData) {
                response.json(authData);
            })
            .catch(httpError.handle(response));
    });

    router.get('/me', ensureAuthenticated, function (request, response) {
        response.json(request.user);
    });

};

module.exports = routes;