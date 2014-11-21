var authVerifier = require('./auth.verifier'),
    authUser = require('./auth.users'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var routes = {};

routes.publish = function (router) {

    router.post('/login', function (request, response) {
        authVerifier.verify(request.body.assertion)
            .then(function (verificationResult) {
                console.log(verificationResult);
                if (verificationResult.status === 'okay') {
                    authUser.login();
                    response.send('OK');
                } else {
                    authUser.logout();
                    response.status(401).send(verificationResult.status);
                }
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error);
            });
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

};

module.exports = routes;