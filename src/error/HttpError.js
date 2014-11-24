var HttpError = {};

HttpError.throw = function (statusCode, message) {
    var error = new Error(message);
    error.status = statusCode;
    throw error;
};

HttpError.handle = function (response) {
    return function (error) {
        if (error.status) {
            response.status(error.status);
        } else {
            response.status(500);
            console.log(error);
        }
        response.send(error.message);
    };
};

module.exports = HttpError;