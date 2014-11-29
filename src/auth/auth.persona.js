var http = require('q-io/http');

var config = require('../../config/config');

var authVerifier = {};

authVerifier.verify = function (assertion) {
    var options = {
        url: 'https://verifier.login.persona.org/verify',
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
            return verificationResult.body.read().then(function (body) {
                return JSON.parse(body);
            });
        });
};

module.exports = authVerifier;