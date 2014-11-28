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

    router.get('/me', ensureAuthenticated, function (request, response) {
        User.findByIdQ(request.user._id)
            .then(function returnEmail(user) {
                response.json(user);
            }).catch(HttpError.handle(response));
    });

    router.put('/me', ensureAuthenticated, function (request, response) {
        var studentEmail = request.body.email;
        if (!studentEmail) return response.status(400).send({message: 'Requires an email'});
        User.findByIdQ(request.user._id)
            .then(function checkUserExists(user) {
                if (!user)
                    HttpError.throw(500, 'Logged user not saved');
                return user;
            })
            // TODO Check is student ?
            .then(function setStudentEmail(student) {
                student.studentEmail = studentEmail;
                return student;
            })
            .then(function saveStudent(student) {
                return student.saveQ();
            })
            .then(function sendResponse() {
                response.send('OK');
            })
            .catch(HttpError.handle(response));
    });

};

module.exports = routes;