var persona = require('./auth.persona'),
    User = require('../user/user.model'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    httpError = require('../error/error.http');

var routes = {};

routes.publish = function (router) {

    router.post('/login', function (request, response) {
        persona
            .verify(request.body.assertion)
            .then(function sendAuthData(authData) {
                response.json(authData);
            })
            .catch(httpError.handle(response));
    });

    router.get('/me', ensureAuthenticated, function (request, response) {
        var learnerProfile = request.learnerProfile;
        User
            .findByLearnerProfileOrCreate(learnerProfile)
            .then(function mergeInfo(user) {
                console.log(user);
                learnerProfile.studentEmail = user.studentEmail;
                response.json(learnerProfile);
            })
            .catch(httpError.handle(response));
    });

    /**
     * Just save studentEmail
     */
    router.put('/me', ensureAuthenticated, function (request, response) {
        var learnerProfile = request.learnerProfile;
        var studentEmail = request.body.studentEmail;
        User
            .findByLearnerProfileOrCreate(learnerProfile)
            .then(function saveStudentEmail(user) {
                user.studentEmail = studentEmail;
                return user.saveQ();
            })
            .then(function (savedUser) {
                console.log(savedUser);
                response.json(savedUser);
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;