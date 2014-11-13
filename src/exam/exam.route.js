var examData = require('./exam.data'),
    sessions = require('./exam.sessions'),
    assesser = require('./assesser'),
    http = require('q-io/http');

var routes = {};

function checkAuthenticated(request, response) {
    var authenticated = true; // TODO some magic !!!
    if (!authenticated) {
        response.status(401).send('Authentication required');
    }
}

routes.publish = function (router) {

    router.post('/session/:sessionId', function (request, response) {
        checkAuthenticated(request, response);
        var sessionId = request.params.sessionId;
        var examId = request.body.examId;
        sessions.create(sessionId, examId).then(function () {
            response.send('OK');
        });
    });

    router.post('/session/:sessionId/registerStudent', function (request, response) {
        var student = {id: 'bob'}; // TODO some magic !!!
        var sessionId = request.params.sessionId;
        sessions.registerStudent(sessionId, student.id);
        response.send('OK');
    });

    router.post('/session/:sessionId/start', function (request, response) {
        checkAuthenticated(request, response);
        var sessionId = request.params.sessionId;
        sessions.start(sessionId);
        response.send('OK');
    });

    router.post('/session/:sessionId/:assessmentId', function (request, response) {
        checkAuthenticated(request, response);
        assesser.assess(request.params.assessmentId, request.body).then(function (result) {
            response.json(result);
        });
    });

    router.post('/exam/:examId', function (request, response) {
        var authentified = true;
        if (authentified) {
            var examId = request.params.examId;
            examData.get(examId)
                .then(function (exam) {
                    response.json(exam);
                })
                .catch(function (error) {
                    response.status(500).send(error.message);
                });
        } else {
            response.status(401).send('You must be authentified to access an exam');
        }
        var student = {
            id: 'Bob'
        };
    });

    router.post('/exam/:examId/:assessmentId', function (request, response) {
        var examId = request.params.examId;
        var assessmentId = request.params.assessmentId;
        examData.get(examId)
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