var _ = require('lodash');

var Session = require('./session.model'),
    httpError = require('../error/error.http');

var sessionMiddleware = {};

/**
 * Requires request.params.sessionId
 */
sessionMiddleware.ensureExists = function (request, response, next) {
    var sessionId = request.params.sessionId;
    Session
        .findByIdQ(sessionId)
        .then(function checkSessionExists(session) {
            if (!session) {
                httpError.throw(404, 'No session found for ID : ' + sessionId);
            } else {
                request.session = session;
                next();
            }
        })
        .catch(httpError.handle(response));
};

/**
 * Depends on session.middleware.ensureExists
 */
sessionMiddleware.ensureIsRunning = function (request, response, next) {
    var session = request.session;
    if (!session.isRunning()) {
        response.status(403).send({message: 'Operation restricted to running sessions'});
    } else {
        next();
    }
};

/**
 * Depends on session.middleware.ensureExists
 */
sessionMiddleware.ensureIsStarted = function (request, response, next) {
    var session = request.session;
    if (!session.started) {
        response.status(403).send({message: 'Please wait for session to start'});
    } else {
        next();
    }
};

/**
 * Depends on session.middleware.ensureExists
 */
sessionMiddleware.ensureIsClosed = function (request, response, next) {
    var session = request.session;
    if (!session.closed) {
        response.status(403).send({message: 'Operation restricted to closed sessions'});
    } else {
        next();
    }
};

/**
 * Depends on auth.middleware.ensureAuthenticated
 * Depends on session.middleware.ensureExists
 */
sessionMiddleware.ensureLoggedUserIsCreator = function (request, response, next) {
    var loggedUserId = request.learnerProfile._id;
    var creatorId = request.session.creator.toString();
    if (creatorId !== loggedUserId) {
        response.status(403).send({message: 'Operation restricted to session creator'});
    } else {
        next();
    }
};

/**
 * Depends on session.middleware.ensureIsRunning
 * Requires request.params.assessmentId
 */
sessionMiddleware.ensureHasAssessment = function (request, response, next) {
    var session = request.session;
    var assessmentId = request.params.assessmentId;
    if (!_.contains(session.assessments, assessmentId)) {
        response.status(409).send({message: 'Assessment is not part of session'});
    } else {
        next();
    }
};

module.exports = sessionMiddleware;