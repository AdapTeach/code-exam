var examData = require('./exam.data');

var sessions = {};

var data = {};

sessions.create = function (sessionId, examId) {
    if (sessions.exists(sessionId))
        throw Error('A session already exists with id : ' + sessionId);
    return examData.get(examId).then(function (exam) {
        data[sessionId] = {
            exam: exam,
            running: false,
            closed: false,
            students: []
        };
    });
};

sessions.exists = function (sessionId) {
    return data[sessionId] !== undefined;
};

sessions.start = function (sessionId) {
    checkExists(sessionId);
    checkNotClosed(sessionId);
    if (sessions.isRunning(sessionId))
        throw Error('Session is already running');
    data[sessionId].running = true;
};

function checkExists(sessionId) {
    if (!sessions.exists(sessionId))
        throw Error('No session exists for id ' + sessionId);
}

function checkNotClosed(sessionId) {
    if (sessions.isClosed(sessionId))
        throw Error('Session is already closed, can\'t change state');
}

sessions.isRunning = function (sessionId) {
    return data[sessionId].running;
};

sessions.isClosed = function (sessionId) {
    return data[sessionId].closed;
};

sessions.close = function (sessionId) {
    checkExists(sessionId);
    checkNotClosed(sessionId);
    if (!sessions.isRunning(sessionId))
        throw Error('Can\'t close a session that is not running');
    data[sessionId].running = false;
    data[sessionId].closed = true;
};

sessions.registerStudent = function (sessionId, studentId) {
    checkExists(sessionId);
    checkNotClosed(sessionId);
    if (data[sessionId][studentId] !== undefined)
        throw  Error('Student has already been registered for this session');
    data[sessionId][studentId] = {id: studentId};
};

sessions.saveResult = function (sessionId, studentId, assessmentId, result) {
    checkExists(sessionId);
    if (data[sessionId][studentId] === undefined)
        throw Error('No student has been registered for this session');
    data[sessionId][studentId][assessmentId] = result;
};

module.exports = sessions;