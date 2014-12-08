var mongoose = require('mongoose-q')(require('mongoose')),
    Schema = mongoose.Schema,
    config = require('../../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment');

var userSchema = new Schema({
    learnerProfile: {
        type: String,
        required: true,
        unique: true
    },
    studentEmail: {
        type: String,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "You should provide a valid email"],
        unique: true
    }
});

userSchema.methods.createJwtToken = function () {
    var payload = {
        user: this,
        iat: moment().valueOf(),
        exp: moment().add(7, 'days').valueOf()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};

userSchema.methods.authData = function () {
    return {
        user: this,
        token: this.createJwtToken()
    };
};

userSchema.statics.authenticate = function (email) {
    return User
        .findByLearnerProfileOrCreate(email)
        .then(function (user) {
            return user.authData();
        });
};

userSchema.statics.findByLearnerProfileOrCreate = function (learnerProfile) {
    return User
        .findOne({learnerProfile: learnerProfile._id})
        .execQ()
        .then(function (user) {
            if (!user) { // no existing user, create a new one and return it
                return new User({learnerProfile: learnerProfile._id, studentEmail: learnerProfile.email}).saveQ();
            } else {
                return user;
            }
        });
};

var User = mongoose.model('User', userSchema);

module.exports = User;
