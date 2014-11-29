var Session = require('../model/session.model'),
    HttpError = require('../error/HttpError');

var sessionMiddleware = {};

sessionMiddleware.ensureExists = function (request, response, next) {
    var sessionId = request.params.sessionId;
    if (!sessionId) {
        response.status(500).send('A session ID param should be defined for this route');
    } else {
        Session
            .findByIdQ(sessionId)
            .then(function checkSessionExists(session) {
                if (!session) {
                    HttpError.throw(404, 'No session found for ID : ' + sessionId);
                } else {
                    request.session = session;
                    next();
                }
            })
            .catch(HttpError.handle(response));
    }
};

sessionMiddleware.ensureIsRunning = function (request, response, next) {
    // TODO Test
    //if (!request.session) {
    //    sessionMiddleware.ensureExists(request,response, this);
    //};
    var session = request.session;
    if (!session.isRunning()) {
        response.status(409).send({message: 'Session is not running'});
    } else {
        next();
    }
};

module.exports = sessionMiddleware;