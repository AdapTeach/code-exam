var http = require('q-io/http');

//var BASE_URL = 'http://localhost:5010/assess';
var BASE_URL = 'http://codeassesser-adapteach.rhcloud.com/assess/';

var Assessments = {};

Assessments.get = function (assessmentId) {
    var options = {
        url: BASE_URL + assessmentId,
        method: 'GET'
    };
    return http.request(options)
        .then(function (response) {
            return response.body.read();
        })
        .then(function (body) {
            return JSON.parse(body);
        });
};

Assessments.assess = function (assessmentId, submission) {
    var options = {
        url: BASE_URL + assessmentId,
        method: 'POST',
        body: [
            JSON.stringify(submission)
        ],
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return http.request(options)
        .then(function (submissionResponse) {
            return submissionResponse.body.read();
        })
        .then(function (body) {
            return JSON.parse(body);
        });
};

module.exports = Assessments;