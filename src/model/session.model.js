var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema;

var sessionSchema = new Schema({
    name: {type: String, required: true},
    assessments: {type: [String], required: true},
    students: {
        type: [Schema.ObjectId],
        ref: 'User'
    }
});

var Session = mongoose.model('Session', sessionSchema);

module.exports = Session;