var _ = require('lodash'),
    Q = require('q');

var Session = require('../session/session.model'),
    Submission = require('../submission/submission.model'),
    User = require('../user/user.model'),
    Result = require('./result.service'),
    httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var sessionMiddleware = require('../session/session.middleware');
var ensureSessionExists = sessionMiddleware.ensureExists;
var ensureSessionIsClosed = sessionMiddleware.ensureIsClosed;
var ensureLoggedUserIsSessionCreator = sessionMiddleware.ensureLoggedUserIsCreator;

var routes = {};

routes.publish = function (router) {

    // LOAD RESULTS FOR SINGLE USER
    router.get('/session/:sessionId', ensureAuthenticated, ensureSessionExists, ensureSessionIsClosed, function (request, response) {
        var session = request.session;
        Result
            .retrieveForStudent(request.learnerProfile, session)
            .then(function (result) {
                response.json(result);
            })
            .catch(httpError.handle(response));
    });

    router.get('/session/:sessionId/all', ensureAuthenticated, ensureSessionExists, ensureLoggedUserIsSessionCreator, function (request, response) {
        var session = request.session;
        User
            .findBySessionId(session._id)
            .then(function buildQueries(students) {
                var queries = [];
                _.forEach(students, function (student) {
                    queries.push(Result.retrieveForStudent(student, session));
                });
                return queries;
            })
            .then(function execute(queries) {
                return Q.all(queries);
            })
            .then(function hideDetails(results) {
                _.forEach(results, function (result) {
                    delete result.details;
                });
                return results;
            })
            .then(function send(results) {
                response.json(results);
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;