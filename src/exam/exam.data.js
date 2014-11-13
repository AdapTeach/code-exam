var q = require('q'),
    http = require('q-io/http'),
    examValidator = require('./exam.validator');

var exams = {};

var DATA_URL = 'https://dl.dropboxusercontent.com/u/1278945/Static%20Data/code-exams/';

exams.get = function (examId) {
    var url = DATA_URL + examId;
    var options = {
        url: url,
        method: 'GET'
    };
    var deferred = q.defer();
    http.request(options)
        .then(function (response) {
            return response.body.read().then(function (body) {
                var exam = JSON.parse(body);
                if (examValidator.validate(exam)) {
                    deferred.resolve(exam);
                } else {
                    deferred.reject({
                        message: 'Exam failed validation : ' + exam.name,
                        assessment: exam
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

module.exports = exams;
