var verifier = require('./auth.persona'),
    httpError = require('../error/error.http');

var authMiddleware = {};

authMiddleware.ensureAuthenticated = function (request, response, next) {
    if (!request.headers.authorization) {
        return response.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }
    var token = request.headers.authorization.split(' ')[1];
    verifier
        .decodeToken(token)
        .then(function (body) {
            request.user = JSON.parse(body);
            next();
        })
        .catch(httpError.handle(response));
};

module.exports = authMiddleware;