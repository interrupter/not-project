var thisModel = require('../models/transport').Transport,
    thisSchema = require('../models/transport').thisSchema,
    async = require('async'),
    config = require('../config'),
    HttpError = require('not-node').Error.Http,
    queryHelpers = require('not-node').QueryHelpers,
    extend = require('extend');

exports._list = function(req, res, next) {
    var size = config.get("pagerSize"),
        skip = req.query.pageNumber ?((Math.max(0, req.query.pageNumber)) * size) : 0;
    //console.log(req.query, size, skip);
    thisModel.list(skip, size, queryHelpers.getSorter(req.query, thisSchema), queryHelpers.getFilter(req.query, thisSchema),function(err, items) {
        var i = 0;
        if(err) {
            return next(err);
        } else {
            res.json(items);
        }
    });
};

exports._listAll = function(req, res, next) {
    thisModel.listAll(function(err, items) {
        var i = 0;
        if(err) {
            return next(err);
        } else {
            res.json(items);
        }
    });
};

exports._count = function(req, res, next) {
    thisModel.count({}, function(err, count) {
        if(err) {
            return next(err);
        } else {
            res.json({
                count: count
            });
        }
    });
}


exports._new = function(req, res, next) {
    var data = req.body;
    delete data._id;
    if(typeof data.driverIDs === 'undefined' || data.driverIDs === null || data.driverIDs.length === 0) {
        data.driverIDs = [];
    }
    //console.log(data);
    thisModel.findOne({}).sort('-transportID').exec(function(err, doc) {
        if(typeof doc === 'undefined' || doc === null) {
            data.transportID = 1;
        } else {
            data.transportID = doc.transportID + 1;
        }
        data.__latest = true;
        var proto = new thisModel(data);
        proto.save(function(err, item) {
            if(err) {
                //console.error(err);
                var i, validationReport = {};
                for(i in err.errors) {
                    validationReport[i] = err.errors[i].message;
                }
                res.json(validationReport, 500);
            } else {
                //console.log('saving version of ', item._id);
                thisModel.saveVersion(item._id, function(err) {
                    if(err) {
                        //console.log('-version not saved ', err);
                    } else {
                        //console.log('+version saved');
                    }
                });
                res.json(item);
            }
        });
    });

};


exports._get = function(req, res, next) {
    var id = req.params._id;
    //console.log(req.params);
    thisModel.getOne(id, function(err, item) {
        if(err) {
            return next(err);
        } else {
            res.json(item);
        }
    });
};

exports._getRaw = function(req, res, next) {
    var id = req.params._id;
    //console.log(req.params);
    thisModel.getOneRaw(id, function(err, item) {
        if(err) {
            return next(err);
        } else {
            res.json(item);
        }
    });
};


exports._update = function(req, res, next) {
    var id = req.params._id;
    delete req.body._id;
    delete req.body.phone;
    if(typeof req.body.driverIDs === 'undefined' || req.body.driverIDs === null || req.body.driverIDs.length === 0) {
        req.body.driverIDs = [];
    }
    //console.log(req.body);
    thisModel.findOneAndUpdate({
        _id: id,
        __latest: true
    }, thisModel.sanitizeInput(req.body), function(err) {
        if(err) {
            return next(err);
        } else {
            //console.log('updated', id);
            thisModel.findById(id, function(err, item) {
                if(!err && typeof item !== 'undefined' && item !== null) {
                    //console.log('saving version of ',id);
                    thisModel.saveVersion(item._id, function(err) {
                        if(err) {
                            //console.log('-version not saved ', err);
                        } else {
                            //console.log('+version saved');
                        }
                    });
                } else {
                    //console.log(id, err, item);
                }

            })
            res.json({});
        }
    });
};


exports._delete = function(req, res, next) {
    var id = req.params._id;
    thisModel.findByIdAndRemove(id, function(err) {
        if(err) {
            return next(err);
        } else {
            res.json({});
        }
    });
};

exports.manifest = {
    model: 'transport',
    url: '/api/:modelName',
    formFieldsTypes: {
        type: {
            type: 'select',
            label: 'Тип'
        },
        brand: {
            type: 'text',
            placeholder: 'Марка'
        },
        model: {
            type: 'text',
            placeholder: 'Модель'
        },
        complectation: {
            type: 'text',
            placeholder: 'Комплектация'
        },
        seatsNumber: {
            type: 'digit',
            placeholder: 'Число мест'
        },
        vehicleClass: {
            type: 'select',
            label: 'Класс (A, B, C)'
        },
        registrationNumber: {
            type: 'text',
            placeholder: 'Гос. Номер'
        },
        firmID: {
            type: 'select',
            label: 'ID компании'
        },
        driverIDs: {
            type: 'multi',
            label: 'ID водителей'
        },
        submit: {
            type: 'submit'
        },
    },
    actions: {
        //ключи это название действий
        new: {
            //каким методом ждем запрос
            method: 'POST',
            //возвращаем массив
            isArray: false,
            //что передавать
            //record - все поля атрибутов из модели на клиенте
            //pager - данные для по страничному выводу
            //filter - данные фильтра
            // можно ввести несколько, передан будет объединенный объект
            //['pager', 'filter'] - данные для поиска с помощью фильтра с возвратом страницы с заданными номером и размером
            data: ['record'],
            auth: true,
            admin: true,
            form: {
                title: 'Создание нового транспортного средства',
                scenario: {
                    admin: {
                        fields: [
                            'type',
                            'brand',
                            'model',
                            'complectation',
                            'seatsNumber',
                            'vehicleClass',
                            'registrationNumber',
                            'firmID',
                            'driverIDs',
                            'submit'
                        ]
                    }
                }
            }
        },
        update: {
            method: 'POST',
            isArray: false,
            //добавка к url'у, вид такой :record[название поля без кавычек]
            postFix: '/:record[_id]/update',
            data: ['record'],
            //должен быть авторизован или нет
            auth: true,
            //должен быть суперпользователем или нет
            admin: true,
            form: {
                title: 'Редактирование транспортного средства',
                scenario: {
                    admin: {
                        fields: [
                            'type',
                            'brand',
                            'model',
                            'complectation',
                            'seatsNumber',
                            'vehicleClass',
                            'registrationNumber',
                            'firmID',
                            'driverIDs',
                            'submit'
                        ]
                    }
                }
            }
        },
        list: {
            method: 'GET',
            isArray: true,
            data: ['pager', 'sorter', 'filter'],
            auth: true,
            admin: true
        },
        listAll: {
            method: 'GET',
            postFix: '/:actionName',
            isArray: true,
            data: [],
            auth: true,
            admin: true
        },
        count: {
            method: 'GET',
            postFix: '/:actionName',
            isArray: false,
            data: [],
            auth: true,
            admin: true
        },
        get: {
            method: 'GET',
            isArray: false,
            postFix: '/:record[_id]',
            data: [],
            auth: true,
            admin: true
        },
        getRaw: {
            method: 'GET',
            isArray: false,
            postFix: '/:record[_id]/:actionName',
            data: [],
            auth: true,
            admin: true
        },
        delete: {
            method: 'DELETE',
            postFix: '/:record[_id]',
            isArray: false,
            auth: true,
            admin: true
        }
    }
};
