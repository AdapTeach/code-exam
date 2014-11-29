var Session = require('./session.model'),
    examData = require('./../exam/exam.data'),
    httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var sessionMiddleware = require('../session/session.middleware');
var ensureSessionExists = sessionMiddleware.ensureExists;
var ensureSessionIsRunning = sessionMiddleware.ensureIsRunning;

var routes = {};

routes.publish = function (router) {

    // CREATE
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
            .catch(httpError.handle(response));
    });

    // START
    router.post('/session/:sessionId/start', ensureAuthenticated, ensureSessionExists, function (request, response) {
        var session = request.session;
        if (session.started) {
            response.send('Session has already started');
        } else {
            session.started = true;
            session
                .saveQ()
                .then(function (savedSession) {
                    var message = 'Session started : ' + savedSession.id;
                    console.log(message);
                    response.send(message);
                })
                .catch(httpError.handle(response));
        }
    });

    // CLOSE
    router.post('/session/:sessionId/close', ensureAuthenticated, ensureSessionExists, ensureSessionIsRunning, function (request, response) {
        var session = request.session;
        session.closed = true;
        session
            .saveQ()
            .then(function (savedSession) {
                var message = 'Session closed : ' + savedSession.id;
                console.log(message);
                response.send(message);
            })
            .catch(httpError.handle(response));
    });

};

module.exports = routes;