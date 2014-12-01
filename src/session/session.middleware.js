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
        response.status(409).send({message: 'Session is not running'});
    } else {
        next();
    }
};

/**
 * Depends on auth.middleware.ensureAuthenticated
 * Depends on session.middleware.ensureExists
 */
sessionMiddleware.ensureLoggedUserIsCreator = function (request, response, next) {
    var loggedUserId = request.user._id;
    var creatorId = request.session.creator.toString();
    if (creatorId !== loggedUserId) {
        response.status(403).send({message: 'Operation restricted to session creator'});
    } else {
        next();
    }
};

module.exports = sessionMiddleware;