var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema;

var sessionSchema = new Schema({
    name: {type: String, required: true},
    assessments: {type: [String], required: true},
    students: {type: [Schema.ObjectId], ref: 'User'},
    started: {type: Boolean, required: true, default: false},
    closed: {type: Boolean, required: true, default: false}
});

sessionSchema.methods.isRunning = function () {
    return this.started && !this.closed;
};

var Session = mongoose.model('Session', sessionSchema);

module.exports = Session;