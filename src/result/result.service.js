var _ = require('lodash'),
    Q = require('q');

var Session = require('../session/session.model'),
    Submission = require('../submission/submission.model'),
    User = require('../user/user.model');

var ResultService = {};

ResultService.retrieveForStudent = function (student, session) {
    var queries = [];
    _.forEach(session.assessments, function (assessmentId) {
        queries.push(Submission.findLatest(student.learnerProfile, session._id, assessmentId));
    });
    return Q.all(queries)
        .then(function (submissionResults) {
            var result = {
                studentEmail: student.studentEmail,
                passed: 0,
                outOf: 0,
                details: []
            };
            _.forEach(submissionResults, function (submissionResult) {
                result.outOf++;
                if (!submissionResult) {
                    return;
                }
                if (submissionResult.result.pass) {
                    result.passed++;
                }
                result.details.push({
                    assessmentId: submissionResult.assessmentId,
                    pass: submissionResult.result.pass,
                    submission: submissionResult.submittedCompilationUnits
                });
            });
            return result;
        });
};

module.exports = ResultService;