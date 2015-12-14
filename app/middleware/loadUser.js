var User = require('../models/user').User,
    config = require('../config');

module.exports = function(req,res, next){    
    req.user = res.locals.user = null;

	if (!req.session.user) return next();
	if (req.session.user == config.get('admin:_id')){
        req.user = res.locals.user = {
            _id: config.get('admin:_id'),
            name: config.get('admin:username'),
            admin: true,
            role: config.get('admin:userRole')
        };
        next();
    }else{
        User.findById(
            req.session.user
        ).exec(function(err, user){
                if (err) return next();
                req.user = res.locals.user = user;
                next();
            });
    }
};
