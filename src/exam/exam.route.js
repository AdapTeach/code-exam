var _ = require('lodash'),
    moment = require('moment');

var Session = require('../model/session.model'),
    User = require('../model/user.model'),
    Submission = require('../model/submission.model'),
    examData = require('./exam.data'),
    assesser = require('./assesser'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated,
    HttpError = require('./HttpError');

var routes = {};

routes.publish = function (router) {

    router.post('/session', ensureAuthenticated, function (request, response) {
        var sessionName = request.body.name;
        var examId = request.body.examId;
        examData
            .get(examId)
            .then(function saveSession(exam) {
                var session = new Session({name: sessionName, assessments: exam.assessments, students: []});
                return session.saveQ().then(function (savedSession) {
                    console.log('Session created : ' + savedSession.id);
                    response.json({id: savedSession.id});
                });
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error.message);
            });
    });

    router.post('/session/:sessionId/registerStudent', ensureAuthenticated, function (request, response) {
        var studentId = request.user._id;
        var sessionId = request.params.sessionId;
        Session
            .findByIdQ(sessionId)
            .then(function (session) {
                var registeredStudentIds = _.map(session.students, function (studentObjectId) {
                    return studentObjectId.toString();
                });
                if (_.contains(registeredStudentIds, studentId)) {
                    response.send('Student already registered');
                } else { // Add student to session
                    session.students.push(studentId);
                    return session.saveQ().then(function () {
                        response.send('OK');
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error.message);
            });
    });

    router.post('/session/:sessionId/start', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        Session
            .findByIdQ(sessionId)
            .then(function (session) {
                if (session.started) {
                    response.send('Session has already started');
                } else {
                    session.started = true;
                    session.saveQ().then(function (savedSession) {
                        console.log('Session started : ' + savedSession.id);
                        response.send('OK');
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error.message);
            });
    });

    router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
        var sessionId = request.params.sessionId;
        var studentId = request.user._id;
        var assessmentId = request.params.assessmentId;
        var submission = request.body;
        Submission
            .findLatest(studentId)
            .then(function checkTimeIntervalBetweenSubmissions(latestSubmission) {
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
                    return assesser.assess(assessmentId, submission);
                } else {
                    response.status(403).send('The sessions has not started yet');
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
            .catch(function (error) {
                if (error.status) {
                    response.status(error.status);
                } else {
                    response.status(500);
                    console.log(error);
                }
                response.send(error.message);
            });
    });

    //router.get('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
    //    var sessionId = request.params.sessionId;
    //    var assessmentId = request.params.assessmentId;
    //    var student = request.user;
    //    console.log(student);
    //    sessions.getLastSubmission(sessionId, student.id, assessmentId)
    //        .then(function (lastSubmission) {
    //            if (lastSubmission === undefined) {
    //                response.status(404).send('Student has not submitted a solution for this assessment yet');
    //            } else {
    //                response.json(lastSubmission);
    //            }
    //        })
    //        .catch(function (error) {
    //            console.log(error);
    //            response.status(500).send(error);
    //        });
    //});

};

module.exports = routes;