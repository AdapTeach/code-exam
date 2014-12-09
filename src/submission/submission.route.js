var Q = require('q'),
    moment = require('moment');

var Submission = require('../submission/submission.model'),
    assessments = require('./../assessment/assessment.service'),
    httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var sessionMiddleware = require('../session/session.middleware'),
    ensureSessionExists = sessionMiddleware.ensureExists,
    ensureSessionIsRunning = sessionMiddleware.ensureIsRunning,
    ensureSessionIsStarted = sessionMiddleware.ensureIsStarted,
    ensureSessionHasAssessment = sessionMiddleware.ensureHasAssessment;

var routes = {};

routes.publish = function (router) {

    // TODO add ensureSessionHasAssessment middleware
    // SUBMIT
    router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, ensureSessionExists, ensureSessionIsRunning, function (request, response) {
        var sessionId = request.session.id;
        var studentId = request.learnerProfile._id;
        var assessmentId = request.params.assessmentId;
        var submission = request.body;
        Submission
            .findLatest(studentId, sessionId, assessmentId)
            .then(function checkTimeIntervalBetweenSubmissions(latestSubmission) {
                if (!latestSubmission) {
                    return; // TODO Save default submission to enforce minimum time between submissions
                }
                var canSubmitAgain = moment(latestSubmission.creationDate).add(1, 'minute');
                if (canSubmitAgain.isAfter(Date.now())) {
                    httpError.throw(403, 'You have to wait for a minute until you can submit again');
                }
            })
            .then(function getAssessmentResult() {
                return assessments.assess(assessmentId, submission);
            })
            .then(function ensureSubmittedCodeCompilesWithoutErrors(submissionResult) {
                if (submissionResult.compilationErrors.length > 0) {
                    httpError.throw(400, 'Compilation Errors ! Submission was not saved');
                }
                return submissionResult;
            })
            .then(function saveSubmissionResult(submissionResult) {
                return new Submission({
                    sessionId: sessionId,
                    studentId: studentId,
                    assessmentId: assessmentId,
                    submittedCompilationUnits: submission.submittedCompilationUnits,
                    result: submissionResult
                }).saveQ();
            })
            .then(function sendResponse(savedSubmission) {
                response.send({
                    submittedCompilationUnits: savedSubmission.submittedCompilationUnits
                });
            })
            .catch(httpError.handle(response));
    });

    // GET LATEST
    router.get('/session/:sessionId/:assessmentId', ensureAuthenticated, ensureSessionExists, ensureSessionIsStarted, function (request, response) {
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var studentId = request.learnerProfile._id;
        Q.all([
            assessments.get(assessmentId),
            Submission.findLatest(studentId, sessionId, assessmentId)
        ])
            .then(function sendResponse(results) {
                var assessment = results[0];
                var latestSubmission = results[1];
                if (latestSubmission) latestSubmission.result = 'hidden'; // TODO Hide only if session is running
                response.json({
                    assessment: assessment,
                    latestSubmission: latestSubmission
                });
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;