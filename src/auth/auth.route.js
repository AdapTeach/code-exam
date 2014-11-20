var authVerifier = require('./auth.verifier'),
    authUser = require('./auth.users');

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

};

module.exports = routes;