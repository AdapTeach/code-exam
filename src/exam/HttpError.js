var HttpError = {};

HttpError.throw = function (statusCode, message) {
    var error = new Error(message);
    error.status = statusCode;
    throw error;
};

module.exports = HttpError;