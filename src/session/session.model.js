var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema;

var sessionSchema = new Schema({
    name: {type: String, required: true},
    creator: {type: Schema.ObjectId, ref: 'User'},
    assessments: {type: [String], required: true},
    students: {type: [Schema.ObjectId], ref: 'User'},
    started: {type: Boolean, required: true, default: false},
    closed: {type: Boolean, required: true, default: false}
});

sessionSchema.methods.start = function () {
    this.started = true;
};

sessionSchema.methods.close = function () {
    this.closed = true;
};

sessionSchema.methods.reopen = function () {
    this.closed = false;
};

sessionSchema.methods.isRunning = function () {
    return this.started && !this.closed;
};

var Session = mongoose.model('Session', sessionSchema);

module.exports = Session;