var HttpError = require('not-node').Error.Http,
    queryHelpers = require('not-node').QueryHelpers,
    async = require('async'),
    nodemailer = require('nodemailer'),
    config = require('../config'),
    extend = require('extend');

exports.main = function (req, res) {
    //console.log('route to main', res.render);
    res.render('layouts/login');
};
