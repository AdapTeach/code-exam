var jwt = require('jwt-simple');
var moment = require('moment');

var config = require('../../config/config');

var authMiddleware = {};

authMiddleware.ensureAuthenticated = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
    }
    var token = req.headers.authorization.split(' ')[1];
    try {
        var payload = jwt.decode(token, config.TOKEN_SECRET);
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({message: 'Token has expired'});
        } else {
            req.user = payload.user;
            next();
        }
    } catch (error) {
        return res.status(401).send({message: error.message});
    }
};

module.exports = authMiddleware;