var config = require('../config'),
    im = require('imagemagick'),
    formidable = require('formidable'),
    crypto = require('crypto'),
    fs = require('fs');


module.exports = function(req, res, next) {
    if (!req.hasOwnProperty('body') || typeof req.body === 'undefined' || req.body === null) req.body = {};
    if (!req.hasOwnProperty('files') || typeof req.files === 'undefined' || req.files === null) req.files = {};
    //console.log("savePhoto", req.body);
    var form = new formidable.IncomingForm();
    var fields = {};
    form.on('field', function(name, value) {
        //console.log(name, value);
        if (fields.hasOwnProperty(name)){
            fields[name]++;
            if (fields[name] === 2){
                req.body[name] = [req.body[name], value];
            }else{
                req.body[name].push(value);
            }
        }else{
            fields[name] = 1;
            req.body[name] = value;
        }
    });
    form.on('file', function(name, value){
        req.files[name] = value;
        if('photo' === name) {
            var imageName = value.path;
            if(imageName) {
                var thumbShortName = crypto.createHash('md5').update(imageName).digest('hex');
                var thumbPath = config.get('appDir') + config.get('paths:photo') + '/' + thumbShortName;
                im.resize({
                    srcPath: imageName,
                    dstPath: thumbPath,
                    width: config.get('thumbs:photo:width'),
                    height: config.get('thumbs:photo:height')
                }, function(err, stdout, stderr) {
                    if(err) {
                        delete req.body.photo;
                    } else {
                        req.body.photo = thumbShortName;
                        //console.log('after resize', req.body);
                    }
                    //console.log('exit from savePhoto');
                    next();
                });
            } else {
                conosle.log('exit from savePhoto');next();
            }
        }
    });
    form.on('progress', function(bytesReceived, bytesExpected) {
        //console.log('progress ',bytesReceived,' / ' ,bytesExpected);
    });
    form.on('end', function(){
        //console.log('form resived');
        if (Object.keys(req.files).length === 0) next();
    });
    form.parse(req);
    //console.log("savePhoto end");
};
