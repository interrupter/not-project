var thisModel = require('../models/driver').Driver,
    thisSchema = require('../models/driver').thisSchema,
    transport = require('../models/transport').Transport,
    HttpError = require('not-node').Error.Http,
    queryHelpers = require('not-node').QueryHelpers,
    async = require('async'),
    config = require('../config'),
    im = require('imagemagick'),
    extend = require('extend');

exports._list = function(req, res, next) {
    var size = config.get("pagerSize"),
        skip = req.query.pageNumber ? ((Math.max(0, req.query.pageNumber)) * size) : 0;
    thisModel.list(skip, size, queryHelpers.getSorter(req.query, thisSchema), queryHelpers.getFilter(req.query, thisSchema), function(err, items) {
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
    console.log(req.body);
    var data = req.body;
    delete data._id;
    if(typeof data.transportIDs === 'undefined' || data.transportIDs === null || data.transportIDs.length === 0) {
        data.transportIDs = [];
    } else {

    }
    thisModel.findOne({}).sort('-driverID').exec(function(err, doc) {
        if(typeof doc === 'undefined' || doc === null) {
            data.driverID = 1;
        } else {
            data.driverID = doc.driverID + 1;
        }
        data.__latest = true;
        var proto = new thisModel(data);
        proto.save(function(err, item) {
            if(err) {
                console.error(err);
                var i, validationReport = {};
                for(i in err.errors) {
                    validationReport[i] = err.errors[i].message;
                }
                res.json(validationReport, 500);
            } else {
                console.log('saving version of ', item._id);

                thisModel.saveVersion(item._id, function(err) {
                    if(err) {
                        console.log('-version not saved ', err);
                    } else {
                        console.log('+version saved');
                    }
                });
                res.json(item);
            }
        });
    });

};


exports._get = function(req, res, next) {
    var id = req.params._id;
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
    console.log('getRaw');
    thisModel.getOneRaw(id, function(err, item) {
        if(err) {
            return next(err);
        } else {
            res.json(item);
        }
    });
};

var versionAfterEdit = function(id) {
    thisModel.findById(id, function(err, item) {
        if(!err && typeof item !== 'undefined' && item !== null) {
            console.log('saving version of ', item._id);

        }
    })
};


exports._update = function(req, res, next) {
    var id = req.params._id;
    //console.log('update', id, req.params, req.body);
    delete req.body._id;
    delete req.body.__versions;
    //console.log('id',id);
    if(typeof req.body.transportIDs === 'undefined' || req.body.transportIDs === null || req.body.transportIDs.length === 0) {
        req.body.transportIDs = [];
    }
    //console.log(req.body);
    thisModel.findOneAndUpdate({
        _id: id,
        __latest: true
    }, thisModel.sanitizeInput(req.body), function(err, item) {
        if(err) {
            return next(err);
        } else {
            thisModel.findById(id, function(err, item) {
                if(!err && typeof item !== 'undefined' && item !== null) {
                    //console.log('saving version of ', item._id, item.toObject());
                    thisModel.saveVersion(item._id, function(err) {
                        if(err) {
                            //console.log('-version not saved ', err);
                        } else {
                            //console.log('+version saved');
                        }
                    });
                } else {
                    //console.error(id, 'item ', item, err);
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
    model: 'driver',
    url: '/api/:modelName',
    formFieldsTypes: {
        fName: {
            type: 'text',
            placeholder: 'Фамилия'
        },
        iName: {
            type: 'text',
            placeholder: 'Имя'
        },
        oName: {
            type: 'text',
            placeholder: 'Отчество'
        },
        dateOfBirth: {
            type: 'date',
            placeholder: 'Дата рождения'
        },
        openCategories: {
            type: 'multi',
            label: 'Открытые категории'
        },
        licenseID: {
            type: 'text',
            placeholder: 'Номер ВУ'
        },
        licenseTill: {
            type: 'date',
            placeholder: 'ВУ действительно до'
        },
        firmID: {
            type: 'select',
            label: 'ID компании'
        },
        transportIDs: {
            type: 'multi',
            label: 'ID транспорта'
        },
        phone: {
            type: 'text',
            placeholder: 'Телефоны'
        },
        photo: {
            type: 'file',
            placeholder: 'Фото'
        },
        comments: {
            type: 'text',
            placeholder: 'Комментарии'
        },
        status: {
            type: 'status',
            label: 'Статус'
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
                title: 'Создание новой записи данных водителя',
                scenario: {
                    admin: {
                        fields: [
                            'fName',
                            'iName',
                            'oName',
                            'dateOfBirth',
                            'openCategories',
                            'licenseID',
                            'licenseTill',
                            'firmID',
                            'transportIDs',
                            'phone',
                            'photo',
                            'comments',
                            'status',
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
                title: 'Редактирование записи данных водителя',
                scenario: {
                    admin: {
                        fields: [
                            'fName',
                            'iName',
                            'oName',
                            'dateOfBirth',
                            'openCategories',
                            'licenseID',
                            'licenseTill',
                            'firmID',
                            'transportIDs',
                            'phone',
                            'photo',
                            'comments',
                            'status',
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
            isArray: true,
            postFix: '/:actionName',
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
