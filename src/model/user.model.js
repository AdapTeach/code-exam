var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema,
    config = require('../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment');

var UserSchema = new Schema({
    email: {
        type: String,
        required: 'you should provide an email',
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "You should provide a valid email"],
        unique: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.methods.createJwtToken = function () {
    var payload = {
        user: this,
        iat: moment().valueOf(),
        exp: moment().add(7, 'days').valueOf()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};

module.exports = mongoose.model('User', UserSchema);
