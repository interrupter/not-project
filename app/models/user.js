var crypto = require('crypto');
var util = require('util');
var http = require('http');
var async = require('async');

var manifest = require('not-node').Manifest;

var mongoose = require('../libs/mongoose');
var Schema = require('../libs/mongoose').Schema;

var schema = new Schema({
    email:{
        type: String,
		unique: true,
		required: true
    },
    //имя пользователя
    username:{
		type: String,
		unique: true,
		required: true
	},
    //хэш пароля
	hashedPassword:{
		type: String,
		required: true
	},
    //соль для хэширования
	salt: {
		type: String,
		required: true
	},
    //дата создания
	created:{
		type: Date,
		default: Date.now
	},
    role:{
        type: String,
        required: true,
        default: 'user'
    },
    //статус пользователя, активен или нет
    status:{
        type: Boolean,
        required: true,
        default: true
    },
    ip:{
        type: String,
        required: false,
        default: ''
    },
    notifications:[{
        type: Schema.Types.Mixed,
        required: false
    }],
    country:{
        type: String,
        required: false,
        default: 'ru'
    },
    primaryLanguage:{
        type: String,
        required: false,
        default: 'ru'
    },
    secondaryLanguages:[{
        type: String,
        required: false
    }],

});


schema.methods.encryptPassword = function(password){
	return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
	.set(function(password){
		this._plainPassword = password;
		this.salt = Math.random() + '';
		this.hashedPassword = this.encryptPassword(password);
	})
	.get(function(){
		return this._plainPassword;
	});

schema.methods.checkPassword = function(password){
	return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(email, password, callback){
	var User = this;
	async.waterfall([
		function(callback){
			User.findOne({email: email}).populate('cart').exec(callback);
		},
		function(user, callback){
			if(user){
				if(user.checkPassword(password)){
                    callback(null, user);
				}else{
					callback(new AuthError('Пароль не верен'));
				}
			}else{
				callback(new AuthError('Пользователь не найден'));
			}
		}

	], callback);
};

schema.statics.getOne = function(id, callback){
    var User = this;
    User.findById(id).populate('cart').exec(callback);
};

schema.statics.toggleStatus = function(id, callback){
    var User = this;
    async.waterfall([
        function(callback){
            User.findById(id, callback);
        },
        function(user, callback){
            if(user){
                user.status = !user.status;
                console.log(user);
                user.save(callback);
            }
        }
    ], callback);
};

schema.statics.clearFromUnsafe = function(user){
    var unsafeList = ['hashedPassword', 'salt'],
        i=0;
    for(i; i<unsafeList.length;i++){
        delete user[i];
    }
    return user;
};
schema.statics.sanitizeInput = function (input) {
    return input;
}

schema.statics.list = function(skip, size, callback){
    var User = this;
    User.find().skip(skip).limit(size).populate('cart').exec(callback);
};

schema.statics.usernameExists = function(username, callback){
    var User = this;
    User.findOne({username: username}, function(err, user){
        if (err || !user){
            callback(false);
        }else{
            if (!user) callback(false);
            else callback(true);
        }
    });
};

schema.statics.emailExists = function(email, callback){
    var User = this;
    User.findOne({email: email}, function(err, user){
        if (err || !user){
            callback(false);
        }else{
            if (!user) callback(false);
            else callback(true);
        }
    });
};


schema.statics.createNotification = function(userId, notifyType, data){
    var User = this;
    async.waterfall([
        function(callback){
            User.findById(userId, callback);
        },
        function(user, callback){
            var notification ={type: notifyType, data: data, new: true, created: new Date()};
            console.log('before adding notify for user ', notification, user.notifications[0],user.notifications.length);
            if(typeof user.notifications == 'undefined' || user.notifications == null || !( 'length' in user.notifications)){
                console.log('create new notifications array');
                user.notifications = [];
            }
            if(!('created' in user.notifications[0])){
               user.notifications = [];
            }
            user.notifications.unshift(notification);
            user.markModified('notifications');
            console.log('add new notify for user ', notification, user.notifications[0],user.notifications.length);
            user.save(function(err, updatedUser){
                if (err){
                    console.error('can\'t update user.notifications');
                }
                console.log('user.notifications.length after update',updatedUser.notifications[0],updatedUser.notifications.length);
            });
        }
    ]);
}

exports.User = mongoose.model('User', schema);

function AuthError(message){
	Error.apply(this, arguments);
	Error.captureStackTrace(this, AuthError);
	this.message = message || "Error";
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;
