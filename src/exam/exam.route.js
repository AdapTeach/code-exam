var sessions = require('./exam.sessions'),
    assesser = require('./assesser'),
    authUser = require('../auth/auth.users'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var routes = {};

routes.publish = function (router) {

    router.post('/session/:sessionId', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        var examId = request.body.examId;
        sessions.create(sessionId, examId).then(function () {
            response.send('OK');
        });
    });

    router.post('/session/:sessionId/registerStudent', ensureAuthenticated, function (request, response) {
        var student = request.user;
        var sessionId = request.params.sessionId;
        sessions.registerStudent(sessionId, student.id);
        response.send('OK');
    });

    router.post('/session/:sessionId/start', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        sessions.start(sessionId);
        response.send('OK');
    });

    router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
        var submission = request.body;
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var student = request.user;
        assesser.assess(assessmentId, submission)
            .then(function (submissionResult) {
                return sessions.saveSubmissionResult(sessionId, student.id, assessmentId, submissionResult);
            })
            .then(function () {
                response.send({
                    savedSubmission: submission
                });
            })
            .catch(function (error) {
                response.status(500).send(error.message);
            });
    });

    router.get('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var student = request.user;
        sessions.getLastSubmission(sessionId, student.id, assessmentId)
            .then(function (lastSubmission) {
                if (lastSubmission === undefined) {
                    response.status(404).send('Student has not submitted a solution for this assessment yet');
                } else {
                    response.json(lastSubmission);
                }
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error);
            });
    });

};

module.exports = routes;