var crypto = require('crypto');
var util = require('util');
var http = require('http');
var async = require('async');
var manifest = require('not-node').Manifest;

var mongoose = require('../libs/mongoose');
var Schema = require('../libs/mongoose').Schema;

 var validators = {
    title: [
        {
            validator: 'isLength',
            arguments: [3, 500],
            message: 'Название компании должно быть от 3 до 500 символов'
        }
    ],
    tripleID: [{
        validator: 'isNumeric',
        message: 'ID number  must be specified'
    }],
};

exports.validators = validators;

exports.thisSchema = {
    title: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['title']),
        searchable: true,
        sortable: true,
    },
    firmID: {
        type: Number,
        required: false,
        validate: manifest.buildValidator(validators['tripleID']),
        searchable: true,
        sortable: true,
    },
    __version: {
        type: Number,
        required: true,
        default: 0
    },
    __latest: {
        type: Boolean,
        required: true,
        default: 0
    },
    __versions: {
        type: [Schema.Types.ObjectId],
        required: false,
        ref: 'Firm',
        default: []
    }
};

var schema = new Schema(exports.thisSchema);

schema.statics.sanitizeInput = function (input) {
    return input;
}

schema.statics.getOne = function (id, callback) {
    var Firm = this;
    Firm.findOne({
        _id: id
    }).populate('__versions').exec(callback);
};

schema.statics.list = function(skip, size, sorter, filter, callback) {
    var Firm = this;
    var query = Firm.find({
        __latest: true
    }).sort(sorter);
    if(filter.length > 0) {
        query.or(filter);
    }
    query.skip(skip).limit(size).exec(callback);
};

schema.statics.listAll = function (callback) {
    var Firm = this;
    Firm.find({__latest: true}).sort([['_id', 'descending']]).exec(callback);
};

schema.statics.saveVersion = require('not-node').Versioning;

exports.Firm = mongoose.model('Firm', schema);
