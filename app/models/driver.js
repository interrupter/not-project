var crypto = require('crypto');
var util = require('util');
var http = require('http');
var async = require('async');

var manifest = require('not-node').Manifest;

var mongoose = require('../libs/mongoose');
var Schema = require('../libs/mongoose').Schema;

var validators = {
    name: [{
        validator: 'isLength',
        arguments: [3, 500],
        message: 'Название компании должно быть от 3 до 500 символов'
    }],
    text: [{
        validator: 'isLength',
        arguments: [0, 500],
        message: 'от 0 до 500 знаков'
    }],
    objectId: [{
        validator: 'isLength',
        arguments: [10, 55],
        message: 'Transport should be specified'
    }],
    tripleID: [{
        validator: 'isNumeric',
        message: 'ID number  must be specified'
    }],
    status: [{
        validator: 'isBoolean',
        message: 'Status should be boolean value'
    }],
};

exports.validators = validators;

exports.thisSchema = {
    fName: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['name']),
        sortable: true,
        searchable: true
    },
    iName: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['name']),
        sortable: true,
        searchable: true
    },
    oName: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['name']),
        sortable: true,
        searchable: true
    },
    dateOfBirth: {
        type: Date
    },
    openCategories: {
        type: [String],
        required: true,
        validate: manifest.buildValidator(validators['text'])
    },
    licenseTill: {
        type: Date
    },
    licenseID: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['text'])
    },
    phone: [{
        type: String,
        required: false
    }],
    driverID: {
        type: Number,
        required: false,
        validate: manifest.buildValidator(validators['tripleID']),
        sortable: true,
        searchable: true
    },
    photo: {
        type: String,
        default: '',
        required: false
    },
    comments: {
        type: String,
        required: false,
        validate: manifest.buildValidator(validators['text'])
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
        validate: manifest.buildValidator(validators['status'])
    },
    transportIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Transport',
        required: false,
        validate: manifest.buildValidator(validators['objectId'])
    }],
    firmID: {
        type: Schema.Types.ObjectId,
        ref: 'Firm',
        required: false,
        validate: manifest.buildValidator(validators['objectId'])
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
    __versions: [{
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Driver',
        default: []
    }]
};

var schema = new Schema(exports.thisSchema);

schema.statics.sanitizeInput = function(input) {
    return input;
}

schema.statics.getOne = function(id, callback) {
    var Driver = this;
    Driver.findOne({
        _id: id
    }).populate('transportIDs').populate('firmID').populate('__versions').exec(callback);
};

schema.statics.getOneRaw = function(id, callback) {
    var Driver = this;
    Driver.findOne({
        _id: id
    }).exec(callback);
};

schema.statics.list = function(skip, size, sorter, filter, callback) {
    var Driver = this;
    console.log('listDriver', arguments);
    var query = Driver.find({
        __latest: true
    }).sort(sorter);
    if  (filter.length>0){
        query.or(filter);
    }
    query.skip(skip).limit(size).exec(callback);
};

schema.statics.listAll = function(callback) {
    var Driver = this;
    Driver.find({
        __latest: true
    }).sort([
        ['_id', 'descending']
    ]).exec(callback);
};

schema.statics.getByDriverId = function(id, callback) {
    if(isNaN(id)) {
        console.log('driver id is ObjectId');
    } else {
        console.log('driver id is driverID');
    }
}

schema.statics.getByTransportId = function(id, callback) {
    if(isNaN(id)) {
        console.log('transport id is ObjectId');
    } else {
        console.log('transport id is transportID');
    }
}

schema.statics.getByFirmId = function(id, callback) {
    if(isNaN(id)) {
        console.log('firm id is ObjectId');
    } else {
        console.log('firm id is firmID');
    }
}

schema.statics.saveVersion = require('not-node').Versioning;

schema.statics.getByDriverId = function(id, callback) {
    if(isNaN(id)) {
        console.log('driver id is ObjectId');
    } else {
        console.log('driver id is driverID');
    }
}

schema.statics.getByTransportId = function(id, callback) {
    if(isNaN(id)) {
        console.log('transport id is ObjectId');
    } else {
        console.log('transport id is transportID');
    }
}

schema.statics.getByFirmId = function(id, callback) {
    if(isNaN(id)) {
        console.log('firm id is ObjectId');
    } else {
        console.log('firm id is firmID');
    }
}

//!TODO:100 Добавление водителя
//!TODO:180 Удаление водителя (закрытие версии)
//!TODO:120 Обновление информации о водителе (обновление версии)
//!TODO:140 Получение информации о водителе по id водителя
//!TODO:150 Получение информации о водителях по id компании

exports.Driver = mongoose.model('Driver', schema);
