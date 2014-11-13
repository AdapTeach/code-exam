var http = require('q-io/http');

var assesser = {};

assesser.assess = function (assessmentId, submission) {
    var options = {
        //url: 'http://localhost:5010/assess/' + assessmentId,
        url: 'http://codeassesser-adapteach.rhcloud.com/assess/' + assessmentId,
        method: 'POST',
        body: [
            JSON.stringify(submission)
        ]
    };
    return http.request(options)
        .then(function (submissionResponse) {
            return submissionResponse.body.read().then(function (body) {
                return JSON.parse(body);
            });
        });
};

module.exports = assesser;