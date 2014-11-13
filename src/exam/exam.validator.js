var validator = require('validator'),
    iz = require('iz');

var assessmentValidator = {};

var validate = function (assessment) {
    var toReturn = true;
    var results = [
        validator.isLength(assessment.id, 2),
        validator.isLength(assessment.title, 2),
        validator.isLength(assessment.instructions, 10),
        iz(assessment.providedCompilationUnits).anArray().required().valid,
        iz(assessment.compilationUnitsToSubmit).anArray().minLength(1).valid,
        iz(assessment.tests).anArray().minLength(1).valid,
        iz(assessment.tips).anArray().required().valid,
        iz(assessment.guides).anArray().required().valid
    ];
    // TODO Validate each individual element in arrays
    // validator.contains(assessment.startCode, 'public class ' + assessment.className + ' {'),
    // validator.isLength(assessment.className, 2)
    results.forEach(function (result) {
        if (!result) {
            //console.log(results);
            toReturn = false;
        }
    });
    return toReturn;
};

assessmentValidator.validate = validate;

assessmentValidator.validateAll = function (assessments) {
    var result = true;
    assessments.forEach(function (assessment) {
        if (!validate(assessment)) {
            result = false;
        }
    });
    return result;
};

module.exports = assessmentValidator;