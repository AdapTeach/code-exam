var Q = require('q'),
    moment = require('moment');

var Submission = require('../submission/submission.model'),
    assessments = require('./../assessment/assessment.service'),
    httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var sessionMiddleware = require('../session/session.middleware'),
    ensureSessionExists = sessionMiddleware.ensureExists,
    ensureSessionIsRunning = sessionMiddleware.ensureIsRunning,
    ensureSessionHasAssessment = sessionMiddleware.ensureHasAssessment;

var routes = {};

routes.publish = function (router) {

    // TODO add ensureSessionHasAssessment middleware
    // SUBMIT
    router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, ensureSessionExists, ensureSessionIsRunning, function (request, response) {
        var session = request.session;
        var studentId = request.user._id;
        var assessmentId = request.params.assessmentId;
        var submission = request.body;
        Submission
            .findLatest(studentId)
            .then(function checkTimeIntervalBetweenSubmissions(latestSubmission) {
                if (!latestSubmission) {
                    return; // TODO Save default submission to enforce minimum time between submissions
                }
                var canSubmitAgain = moment(latestSubmission.creationDate).add(1, 'minute');
                if (canSubmitAgain.isAfter(Date.now())) {
                    httpError.throw(403, 'You have to wait for a minute until you can submit again');
                } else {
                    return;
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
                    sessionId: session.id,
                    studentId: studentId,
                    assessmentId: assessmentId,
                    compilationUnits: submission.compilationUnits,
                    result: submissionResult
                }).saveQ();
            })
            .then(function sendResponse(savedSubmission) {
                response.send({
                    compilationUnits: savedSubmission.compilationUnits
                });
            })
            .catch(httpError.handle(response));
    });

    // GET LATEST
    router.get('/session/:sessionId/:assessmentId', ensureAuthenticated, ensureSessionExists, ensureSessionIsRunning, function (request, response) {
        var sessionId = request.params.sessionId;
        var assessmentId = request.params.assessmentId;
        var studentId = request.user._id;
        Q.all([
            assessments.get(assessmentId),
            Submission.findLatest(studentId, sessionId, assessmentId)
        ])
            .then(function sendResponse(results) {
                var assessment = results[0];
                var latestSubmission = results[1];
                response.json({
                    assessment: assessment,
                    latestSubmission: latestSubmission
                });
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;