var mongoose = require('mongoose-q')(),
    Schema = mongoose.Schema,
    config = require('../../config/config'),
    jwt = require('jwt-simple'),
    moment = require('moment'),
    Q = require('q');

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

UserSchema.statics.authenticate = function (email) {
    var deferred = Q.defer();

    UserModel
        .findOne({email: email})
        .execQ()
        .then(function (user) {
            if (user) {
                var authData = {
                    user: user,
                    token: user.createJwtToken()
                };
                deferred.resolve(authData);
            } else {
                new UserModel({email: email})
                    .saveQ()
                    .then(function (savedUser) {
                        deferred.resolve({
                            user: savedUser,
                            token: savedUser.createJwtToken()
                        });
                    }).fail(function (error) {
                        deferred.reject(error);
                    });
            }
        });

    return deferred.promise;
};

var UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
