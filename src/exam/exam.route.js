var examData = require('./exam.data'),
    sessions = require('./exam.sessions'),
    assesser = require('./assesser'),
    http = require('q-io/http');

var routes = {};

function checkAuthenticated(request, response) {
    var authenticated = true; // TODO some magic !!!
    if (!authenticated) {
        response.status(401).send('Authentication required');
    }
}

routes.publish = function (router) {

    router.post('/session/:sessionId', function (request, response) {
        checkAuthenticated(request, response);
        var sessionId = request.params.sessionId;
        var examId = request.body.examId;
        sessions.create(sessionId, examId).then(function () {
            response.send('OK');
        });
    });

    router.post('/session/:sessionId/registerStudent', function (request, response) {
        var student = {id: 'bob'}; // TODO some magic !!!
        var sessionId = request.params.sessionId;
        sessions.registerStudent(sessionId, student.id);
        response.send('OK');
    });

    router.post('/session/:sessionId/start', function (request, response) {
        checkAuthenticated(request, response);
        var sessionId = request.params.sessionId;
        sessions.start(sessionId);
        response.send('OK');
    });

    router.post('/session/:sessionId/:assessmentId', function (request, response) {
        checkAuthenticated(request, response);
        var submission = request.body;
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var studentId = 'bob'; // TODO magic !
        assesser.assess(assessmentId, submission)
            .then(function (submissionResult) {
                return sessions.saveSubmissionResult(sessionId, studentId, assessmentId, submissionResult);
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

    router.get('/session/:sessionId/:assessmentId', function (request, response) {
        checkAuthenticated(request, response);
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var studentId = 'bob'; // TODO magic !
        sessions.getLastSubmission(sessionId, studentId, assessmentId)
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