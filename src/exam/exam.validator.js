var validator = require('validator'),
    iz = require('iz');

var examValidator = {};

var validate = function (exam) {
    var toReturn = true;
    var results = [
        //validator.isLength(exam.id, 2),
        //validator.isLength(exam.title, 2),
        //validator.isLength(exam.instructions, 10),
        //iz(exam.providedCompilationUnits).anArray().required().valid,
        //iz(exam.compilationUnitsToSubmit).anArray().minLength(1).valid,
        //iz(exam.tests).anArray().minLength(1).valid,
        //iz(exam.tips).anArray().required().valid,
        //iz(exam.guides).anArray().required().valid
    ];
    // TODO Validate each individual element in arrays
    // validator.contains(exam.code, 'public class ' + exam.className + ' {'),
    // validator.isLength(exam.className, 2)
    results.forEach(function (result) {
        if (!result) {
            //console.log(results);
            toReturn = false;
        }
    });
    return toReturn;
};

examValidator.validate = validate;

examValidator.validateAll = function (exams) {
    var result = true;
    exams.forEach(function (exam) {
        if (!validate(exam)) {
            result = false;
        }
    });
    return result;
};

module.exports = examValidator;