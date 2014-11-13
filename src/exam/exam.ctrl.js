var q = require('q'),
    http = require('q-io/http'),
    assessmentValidator = require('./exam.validator');

var assessments = {};

var DATA_URL = 'https://dl.dropboxusercontent.com/u/1278945/Static%20Data/code-exams/';

assessments.get = function (assessmentId) {
    var url = DATA_URL + assessmentId;
    var options = {
        url: url,
        method: 'GET'
    };
    var deferred = q.defer();
    http.request(options)
        .then(function (response) {
            return response.body.read().then(function (body) {
                var assessment = JSON.parse(body);
                if (assessmentValidator.validate(assessment)) {
                    deferred.resolve(assessment);
                } else {
                    deferred.reject({
                        message: 'Assessment failed validation : ' + assessment.name,
                        assessment: assessment
                    });
                }
            });
        })
        .catch(function (error) {
            deferred.reject({
                message: 'Error loading JSON',
                error: error
            });
        });
    return deferred.promise;
};

module.exports = assessments;
