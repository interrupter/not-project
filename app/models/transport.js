var crypto = require('crypto');
var util = require('util');
var http = require('http');
var async = require('async');
var manifest = require('not-node').Manifest;

var mongoose = require('../libs/mongoose');
var Schema = require('../libs/mongoose').Schema;

var validators = {
    text: [{
        validator: 'isLength',
        arguments: [1, 500],
        message: 'от 1 до 500 знаков'
    }],
    type: [{
        validator: 'isLength',
        arguments: [3, 500],
        message: 'Тип'
    }],
    objectId: [{
        validator: 'isLength',
        arguments: [10, 55],
        message: 'Transport should be specified'
    }],
    seatsNumber: [{
        validator: 'isNumeric',
        message: 'Number of seats must be specified'
    }],
    tripleID: [{
        validator: 'isNumeric',
        message: 'ID number  must be specified'
    }],
    status: [{
        validator: 'isBoolean',
        message: 'Status should be boolean value'
    }]
};

exports.validators = validators;

exports.thisSchema = {
    type: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['type'])
    },
    brand: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['text']),
        searchable: true,
        sortable: true
    },
    model: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['text']),
        searchable: true,
        sortable: true
    },
    complectation: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['text'])
    },
    seatsNumber: {
        type: Number,
        required: true,
        validate: manifest.buildValidator(validators['seatsNumber'])
    },
    vehicleClass: {
        type: String,
        enum: ['a', 'b', 'c'],
        required: true,
        validate: manifest.buildValidator(validators['text']),
        searchable: true,
        sortable: true
    },
    registrationNumber: {
        type: String,
        required: true,
        validate: manifest.buildValidator(validators['text']),
        searchable: true,
        sortable: true
    },
    transportID: {
        type: Number,
        required: false,
        validate: manifest.buildValidator(validators['tripleID']),
        searchable: true,
        sortable: true
    },
    firmID: {
        type: Schema.Types.ObjectId,
        ref: 'Firm',
        required: false,
        validate: manifest.buildValidator(validators['objectId'])
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
        validate: manifest.buildValidator(validators['status'])
    },
    driverIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Driver',
        required: false,
        validate: manifest.buildValidator(validators['objectId'])
    }],
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

//schema.pre('save', function (next) { this.increment(); next(); });

schema.statics.sanitizeInput = function(input) {
    return input;
}

schema.statics.getOne = function(id, callback) {
    var Transport = this;
    Transport.findOne({
        _id: id
    }).populate('driverIDs').populate('firmID').populate('__versions').exec(callback);
};

schema.statics.getOneRaw = function(id, callback) {
    var Transport = this;
    Transport.findById(id, callback);
};

schema.statics.list = function(skip, size, sorter, filter, callback) {
    var Transport = this;
    var query = Transport.find({
        __latest: true
    }).sort(sorter);
    if(filter.length > 0) {
        query.or(filter);
    }
    query.skip(skip).limit(size).exec(callback);
};

schema.statics.listAll = function(callback) {
    var Transport = this;
    Transport.find({
        __latest: true
    }).sort([
        ['_id', 'descending']
    ]).exec(callback);
};

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

//!TODO:110 Добавление транспорта
//!TODO:190 Удаление транспорта (закрытие версии)
//!TODO:130 Обновление информации о транспорте (обновление версии)
//!TODO:160 Получение информации о транспорте по id водителя
//!TODO:170 Получение информации о транспорте по id компании

exports.Transport = mongoose.model('Transport', schema);
