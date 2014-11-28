var authVerifier = require('./auth.verifier'),
    User = require('../model/user.model'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    HttpError = require('../error/HttpError');

var routes = {};

routes.publish = function (router) {

    router.post('/login', function (request, response) {
        authVerifier
            .verify(request.body.assertion)
            .then(function checkStatus(verificationResult) {
                if (verificationResult.status !== 'okay') {
                    HttpError.throw(401, verificationResult.status);
                }
                return verificationResult.email;
            })
            .then(function authenticate(email) {
                return User.authenticate(email);
            })
            .then(function sendResponse(authData) {
                response.json(authData);
            })
            .catch(HttpError.handle(response));
    });

    router.get('/me', ensureAuthenticated, function (req, res) {
        //User.findById(req.user, function (err, user) {
        //    res.send(user);
        //});
    });

    router.put('/me', ensureAuthenticated, function (req, res) {
        //User.findById(req.user, function (err, user) {
        //    if (!user) {
        //        return res.status(400).send({message: 'User not found'});
        //    }
        //    user.displayName = req.body.displayName || user.displayName;
        //    user.email = req.body.email || user.email;
        //    user.save(function (err) {
        //        res.status(200).end();
        //    });
        //});
    });

}
;

module.exports = routes;