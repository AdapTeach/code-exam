var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema;

var submissionSchema = new Schema({
    creationDate: {type: Date, default: Date.now},
    sessionId: {
        type: Schema.ObjectId,
        ref: 'Session',
        required: true
    },
    studentId: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    assessmentId: {
        type: String,
        required: true
    },
    compilationUnits: [
        {
            name: String,
            code: String
        }
    ],
    result: {
        pass: Boolean,
        compilationError: [String],
        failedTestMessages: [String]
    }
});

submissionSchema.statics.findLatest = function (studentId) {
    return Submission.findOneQ({studentId: studentId}, null, {sort: {creationDate: -1}});
};

var Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;