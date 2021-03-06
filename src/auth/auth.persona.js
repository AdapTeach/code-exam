var http = require('q-io/http');

var config = require('../../config/config');

var httpError = require('../error/error.http');

var persona = {};

persona.verify = function (assertion) {
    var options = {
        url: config.authUrl + '/login',
        method: 'POST',
        body: [
            JSON.stringify({
                assertion: assertion,
                audience: config.clientUrl
            })
        ],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return http.request(options)
        .then(function (verificationResult) {
            return verificationResult.body.read();
        })
        .then(function (authData) {
            return JSON.parse(authData);
        });
};

persona.decodeToken = function (token) {
    var options = {
        url: config.authUrl + '/me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };
    return http.request(options)
        .then(function checkStatus(result) {
            if (result.status !== 200) httpError.throw(result.status, 'Error decoding token');
            return result;
        })
        .then(function (result) {
            return result.body.read();
        })
        .then(function (body) {
            return JSON.parse(body);
        });
};

module.exports = persona;