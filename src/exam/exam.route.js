var _ = require('lodash');

var Session = require('../model/session.model'),
    examData = require('./exam.data'),
    User = require('../model/user.model'),
    assesser = require('./assesser'),
    ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

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

    //
    //router.post('/session/:sessionId/:assessmentId', ensureAuthenticated, function (request, response) {
    //    var submission = request.body;
    //    var sessionId = request.params.sessionId;
    //    var assessmentId = request.params.assessmentId;
    //    var student = request.user;
    //    assesser.assess(assessmentId, submission)
    //        .then(function (submissionResult) {
    //            return sessions.saveSubmissionResult(sessionId, student.id, assessmentId, submissionResult);
    //        })
    //        .then(function () {
    //            response.send({
    //                savedSubmission: submission
    //            });
    //        })
    //        .catch(function (error) {
    //            response.status(500).send(error.message);
    //        });
    //});
    //
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