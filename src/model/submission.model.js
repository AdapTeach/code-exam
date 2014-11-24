var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema;

module.exports = mongoose.model('Submission',
    new Schema({
        userId: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        sessionId: {
            type: Schema.ObjectId,
            ref: 'Session'
        },
        assessmentId: {
            type: Object
        },
        compilationUnit: {
            type: Object
        }
    })
);