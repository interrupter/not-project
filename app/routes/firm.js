var thisModel = require('../models/firm').Firm,
    thisSchema = require('../models/firm').thisSchema,
    HttpError = require('not-node').Error.Http,
    queryHelpers = require('not-node').QueryHelpers,
    async = require('async'),
    config = require('../config'),
    extend = require('extend');

exports._list = function(req, res, next) {
    var size = config.get("pagerSize"),
        skip = req.query.pageNumber ? ((Math.max(0, req.query.pageNumber)) * size):0;
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
    var data = req.body;
    delete data._id;
    //console.log(data);
    thisModel.findOne({}).sort('-firmID').exec(function(err, doc) {
        if(typeof doc === 'undefined' || doc === null) {
            data.firmID = 1;
        } else {
            data.firmID = doc.firmID + 1;
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


exports._update = function(req, res, next) {
    var id = req.params._id;
    delete req.body._id;
    //console.log(req.body);
    thisModel.findOneAndUpdate({
        _id: id,
        __latest: true
    }, thisModel.sanitizeInput(req.body), function(err) {
        if(err) {
            return next(err);
        } else {
            thisModel.findById(id, function(err, item) {
                if(!err && typeof item !== 'undefined' && item !== null) {
                    //console.log('saving version of ',item._id);
                    thisModel.saveVersion(item._id, function(err) {
                        if(err) {
                            //console.log('-version not saved ', err);
                        } else {
                            //console.log('+version saved');
                        }
                    });
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
    model: 'firm',
    url: '/api/:modelName',
    formFieldsTypes: {
        title: {
            type: 'text',
            placeholder: 'Название компании'
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
                title: 'Создание новой компании',
                scenario: {
                    admin: {
                        fields: ['title', 'submit']
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
                title: 'Редактирование фирмы',
                scenario: {
                    admin: {
                        fields: ['title', 'submit']
                    }
                }
            }
        },
        listAll: {
            method: 'GET',
            isArray: true,
            postFix: '/:actionName',
            data: [],
            auth: true,
            admin: true
        },
        list: {
            method: 'GET',
            isArray: true,
            data: ['pager', 'sorter', 'filter'],
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
        delete: {
            method: 'DELETE',
            postFix: '/:record[_id]',
            isArray: false,
            auth: true,
            admin: true
        }
    }
};
