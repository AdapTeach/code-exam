var httpError = require('../error/error.http');

var ensureAuthenticated = require('../auth/auth.middleware').ensureAuthenticated;

var ensureSessionExists = require('../session/session.middleware').ensureExists;

var routes = {};

routes.publish = function (router) {

    // REGISTER
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
    //.catch(httpError.handle(response));
    //});

};

module.exports = routes;