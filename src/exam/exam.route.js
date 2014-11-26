var _ = require('lodash'),
    moment = require('moment'),
    Q = require('q');

var Session = require('../model/session.model'),
    User = require('../model/user.model'),
    Submission = require('../model/submission.model'),
    examData = require('./exam.data'),
    Assessments = require('./Assessments'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    HttpError = require('../error/HttpError');

var routes = {};

routes.publish = function (router) {

    router.post('/session', ensureAuthenticated, function (request, response) {
        var sessionName = request.body.name;
        var examId = request.body.examId;
        examData
            .get(examId)
            .then(function saveSession(exam) {
                return new Session({
                    name: sessionName,
                    assessments: exam.assessments,
                    students: []
                }).saveQ();
            })
            .then(function sendResponse(savedSession) {
                console.log('Session created : ' + savedSession.id);
                response.json({id: savedSession.id});
            })
            .catch(HttpError.handle(response));
    });

    // TODO Make sure submitting students are registered for a session
    //router.post('/session/:sessionId/registerStudent', ensureAuthenticated, function (request, response) {
    //    var studentId = request.user._id;
    //    var sessionId = request.params.sessionId;
    //    Session
    //        .findByIdQ(sessionId)
    //        .then(function (session) {
    //            var registeredStudentIds = _.map(session.students, function (studentObjectId) {
    //                return studentObjectId.toString();
    //            });
    //            if (_.contains(registeredStudentIds, studentId)) {
    //                response.send('Student already registered');
    //            } else { // Add student to session
    //                session.students.push(studentId);
    //                return session.saveQ().then(function () {
    //                    response.send('OK');
    //                });
    //            }
    //        })
    //.catch(HttpError.handle(response));
    //});

    router.post('/session/:sessionId/start', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        Session
            .findByIdQ(sessionId)
            .then(function (session) {
                if (!session) {
                    HttpError.throw(404, 'No session found for ID : ' + sessionId);
                } else if (session.started) {
                    response.send('Session has already started');
                } else {
                    session.started = true;
                    session.saveQ().then(function (savedSession) {
                        console.log('Session started : ' + savedSession.id);
                        response.send('OK');
                    });
                }
            })
            .catch(HttpError.handle(response));
    });

    router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        var studentId = request.user._id;
        var assessmentId = request.params.assessmentId;
        var submission = request.body;
        Submission
            .findLatest(studentId)
            .then(function checkTimeIntervalBetweenSubmissions(latestSubmission) {
                if (!latestSubmission) {
                    return;
                }
                var canSubmitAgain = moment(latestSubmission.creationDate).add(1, 'minute');
                if (canSubmitAgain.isAfter(Date.now())) {
                    HttpError.throw(403, 'You have to wait for a minute until you can submit again');
                } else {
                    return;
                }
            })
            .then(function getSession() {
                return Session.findByIdQ(sessionId);
            })
            .then(function getAssessmentResult(session) {
                if (session.started) {
                    return Assessments.assess(assessmentId, submission);
                } else {
                    HttpError.throw(403, 'The sessions has not started yet');
                }
            })
            .then(function saveSubmissionResult(submissionResult) {
                return new Submission({
                    sessionId: sessionId,
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
            .catch(HttpError.handle(response));
    });

    router.get('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
            var sessionId = request.params.sessionId;
            var assessmentId = request.params.assessmentId;
            var studentId = request.user._id;
            Q.all([
                Assessments.get(assessmentId),
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
                .catch(HttpError.handle(response));
        }
    )
    ;

}
;

module.exports = routes;