var assessmentData = require('./assessments'),
    http = require("q-io/http");

var routes = {};

routes.publish = function (router) {

    router.get('/assess/:assessmentId', function (request, response) {
        var assessmentId = request.params.assessmentId;
        assessmentData.get(assessmentId)
            .then(function (assessment) {
                delete assessment.tests;
                delete assessment.tips;
                delete assessment.guides;
                response.json(assessment);
            })
            .catch(function (error) {
                response.status(500).send(error.message);
            });
    });

    router.post('/assess/:assessmentId', function (request, response) {
        var assessmentId = request.params.assessmentId;
        assessmentData.get(assessmentId)
            .then(function (assessment) {
                var compilationUnits = request.body.compilationUnits;
                var options = {
                    //url: 'http://localhost:5020/v1/',
                    url: 'http://54.171.154.216:5020/v1/',
                    method: 'POST',
                    body: [
                        JSON.stringify({
                            assessment: assessment,
                            compilationUnits: compilationUnits
                        })
                    ]
                };
                return http.request(http.normalizeRequest(options))
                    .then(function (submissionResponse) {
                        return submissionResponse.body.read().then(function (body) {
                            response
                                .status(submissionResponse.status)
                                .json(JSON.parse(body));
                        });
                    });
            })
            .catch(function (error) {
                console.log(error);
                response.status(500).send(error.message);
            });
    });

};

module.exports = routes;