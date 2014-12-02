var _ = require('lodash'),
    Q = require('q');

var Session = require('../session/session.model'),
    Submission = require('../submission/submission.model'),
    httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var sessionMiddleware = require('../session/session.middleware');
var ensureSessionExists = sessionMiddleware.ensureExists;
var ensureSessionIsClosed = sessionMiddleware.ensureIsClosed;

var routes = {};

routes.publish = function (router) {

    // LOAD RESULTS
    router.get('/session/:sessionId', ensureAuthenticated, ensureSessionExists, ensureSessionIsClosed, function (request, response) {
        var sessionId = request.session._id;
        var studentId = request.user._id;
        var queries = [];
        _.forEach(request.session.assessments, function (assessmentId) {
            queries.push(Submission.findLatest(studentId, sessionId, assessmentId));
        });
        Q.all(queries)
            .then(function (submissionResults) {
                var result = {
                    passed: 0,
                    outOf: 0,
                    details: []
                };
                _.forEach(submissionResults, function (submissionResult) {
                    result.outOf++;
                    if (!submissionResult) {
                        return;
                    }
                    if (submissionResult.result.pass) {
                        result.passed++;
                    }
                    result.details.push({
                        assessmentId: submissionResult.assessmentId,
                        pass: submissionResult.result.pass
                    });
                });
                response.send(result);
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;