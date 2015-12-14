var HttpError = require('not-node').Error.Http,
    async = require('async'),
    config = require('../config'),
    extend = require('extend');

exports.main = function(req, res){
    res.render('dashboard');
};
