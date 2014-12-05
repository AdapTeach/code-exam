var http = require('q-io/http');

var config = require('../../config/config');

var authVerifier = {};

authVerifier.verify = function (assertion) {
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

authVerifier.decodeToken = function (token) {
    var options = {
        url: config.authUrl + '/me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };
    return http.request(options)
        .then(function (result) {
            return result.body.read();
        });
};

module.exports = authVerifier;