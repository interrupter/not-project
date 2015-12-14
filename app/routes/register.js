var User = require('../models/user').User;
var HttpError = require('not-node').Error.Http;
var queryHelpers = require('not-node').QueryHelpers;
var AuthError = require('../models/user').AuthError;
var async = require('async'),
    check = require('iz').validators,
    config = require('../config');

exports.register = function (req, res, next) {
    var username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        password2 = req.body.password2;

    this.method = 'POST';

    //проверить что имя пользователя не в базе и не админское
    if (check.email(email) && !check.equal(email, config.get('admin:username'))) {
        User.usernameExists(username, function (exists) {
            if (exists) {
                return next(new HttpError(403, 'Имя пользователя занято.'));
            } else {
                User.emailExists(email, function (exists) {
                    if (exists) {
                        return next(new HttpError(403, 'Этот адрес E-mail уже используется.'));
                    } else {
                        if (check.minLength(password, 6) && check.maxLength(password, 256) && check.equal(password, password2)) {
                            console.log('>>>>>this user is valid to register');
                            var newUser = new User({
                                'email': email,
                                'username': username,
                                'password': password
                            });
                            newUser.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    return next(new HttpError(500, 'Что-то пошло не так'));
                                }
                                console.log('>>>>>this user saved');
                                User.authorize(email, password, function (err, user) {
                                    if (err) {
                                        if (err instanceof AuthError) {
                                            return next(new HttpError(403, err.message));
                                        } else {
                                            return next(err);
                                        }
                                    }
                                    console.log('>>>>>this user authorized');
                                    req.session.user = user._id;
                                    res.json({
                                        user: user
                                    });
                                });
                            });
                        }
                    }
                });
            }
        });
    } else {
        res.send(404);
    }
};

exports.restore = function (req, res, next) {
    var userId = req.session.user,
        password = req.body.password,
        newPassword = req.body.newPassword,
        newPassword2 = req.body.newPassword2;

    this.method = 'POST';

    if (check.minLength(newPassword, 6) && check.maxLength(newPassword, 256) && check.equal(newPassword, newPassword2)) {
        User.getOne(userId, function (err, user) {
            if (err) {
                return next(new HttpError(404, 'Пользователь не найден.'));
            }
            user.password = newPassword;
            user.save(function (err) {
                if (err) {
                    return next(new HttpError(500, 'Пользователь не может быть сохранён.'));
                }
                res.json({});
            });
        });
    } else {
        console.log(req.body);
        return next(new HttpError(500, 'Не верный новый пароль. '));
    }
};

exports.login = function (req, res, next) {
    console.log('login');
    var email = req.body.email,
        password = req.body.password,
        ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    //console.log(config.get('admin:username'),config.get('admin:password'));
    if ((email == config.get('admin:username')) && (password == config.get('admin:password'))) {
        req.session.user = config.get('admin:_id');
        req.session.userRole = config.get('admin:userRole');
        res.json({});
    } else {
        User.authorize(email, password, function (err, user) {
            if (err) {
                if (err instanceof AuthError) {
                    return res.status(403).json({
                        error: err.message
                    });
                } else {
                    return next(err);
                }
            } else {
                req.session.user = user._id;
                req.session.userRole = user.role;
                user.ip = ip;
                res.json({
                    user: user
                });
            }
        });
    }
};

exports.logout = function (req, res) {
    req.session.destroy();
    res.json({});
};

exports.status = function (req, res) {
    var userStatus = {
        auth: false,
        admin: false,
        model: 'user',
        data: null
    };
    if (req.session.user) {
        userStatus.auth = true;
        userStatus.profileLink = '#profile';
    }
    if (req.session.user && (req.session.userRole === 'root')) {
        userStatus.admin = true;
        userStatus.profileLink = '/admin';
    }
    res.json(userStatus);
}


exports.manifest = {
    model: '',
    url: '/:actionName',
    showMessages: true,
    actions: {
        login: {
            method: 'POST',
            isArray: false,
            data: ["record"],
            auth: false,
            messages: {
                success: 'You\'are loged in!'
            }
        },
        logout: {
            method: 'POST',
            isArray: false,
            auth: true,
            messages: {
                success: 'You\'are loged out!'
            }
        },
        restore: {
            method: 'POST',
            isArray: false,
            data: ["record"],
            auth: false
        },
        register: {
            method: 'POST',
            isArray: false,
            data: ["record"],
            auth: false
        },
        status: {
            method: 'GET',
            isArray: false,
            auth: false
        },
    }
};
