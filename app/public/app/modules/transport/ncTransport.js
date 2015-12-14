var ncTransport = function(app, params) {
    console.log('register ncTransport');
    var not = this;
    not.viewsPrefix = '/app/modules/transport/';
    not.commonViewsPrefix = app.getOptions().commonPath;
    not.containerId = 'page-wrapper';
    not.container = document.getElementById(not.containerId);
    not.viewsPostfix = '.html';
    not.renderFromURL = true;
    not.tableView = null;
    not.collection = jQuery.extend(true, {}, not.nrTransport);
    not.model = jQuery.extend(true, {}, not.nrTransport);
    not.lib = {
    };

    not.nrFirm.$listAll(function(data){
        not.lib.firms = data;
    });

    not.nrDriver.$listAll(function(data){
        for(var i = 0; i < data.length; i++) {
            data[i].title = [data[i].driverID, data[i].fName, data[i].iName, data[i].oName].join(' ');
        }
        not.lib.drivers = data;
    });

    not.views = {
        list: {
            common: true,
            placeId: not.containerId
        },
        view: {
            common: true,
            placeId: not.containerId
        },
        edit: {
            common: true,
            placeId: not.containerId
        },
        latestVersion:{
            common: false,
            name: 'details',
            placeId: 'latestVersion'
        },
        archiveVersion:{
            common: false,
            name: 'details',
            placeId: 'archiveVersion'
        },
        details: {
            helpers: {
                driverList: function(item, index) {
                    var list = '';
                    if(item.driverIDs instanceof Array) {
                        for(var i = 0; i < item.driverIDs.length; i++) {
                            list += '<li><a href="/admin#driver/' + item.driverIDs[i]._id + '">' + [item.driverIDs[i].driverID, item.driverIDs[i].fName, item.driverIDs[i].iName, item.driverIDs[i].oName].join(' ') + '</a></li>';
                        }
                    }
                    return list;
                },
                firmID: function(titem, index) {
                    return [titem.firmID.firmID, titem.firmID.title].join(' - ');
                }
            }
        }
    };

    not.initItem = function() {
        var newRecord = jQuery.extend(true, {}, not.nrTransport);
        newRecord.setAttrs({
            '_id': null,
            title: 'Транспорт'
        });
        return newRecord;
    }

    not.updateDatatable = function(data) {
        not.tableView = new notTable({
            templateUrl: '/app/common/table.html',
            place: document.getElementById('tablePlace'),
            helpers:{
                tableTitle: 'Транспорт'
            },
            headerTitles: [{
                title: 'ID',
                field: 'transportID',
                sortable: true
            }, {
                field: 'brand',
                title: 'Марка',
                sortable: true
            }, {
                field: 'model',
                title: 'Модель',
                sortable: true
            }, {
                field: 'vehicleClass',
                title: 'Класс',
                sortable: true
            }, {
                field: 'registrationNumber',
                title: 'Номер'
            }, {
                field: '_id',
                title: 'Действия',
                proccessor: function(value, item, index) {
                    return '<a href="/admin#transport/' + value + '">Смотреть</a>';
                }
            }],
            data: data,
            pageSize: 50,
            pageNumber: 0,
            onePager: true,
            liveLoad: true,
            notRecord: not.collection
        });
        document.getElementById('tablePlace').classList.add('show');
    }

    not.loadList = function(page) {
        not.collection.$list(not.updateDatatable);
    }

    not.showNextPage = function(){
        console.log('show page');
        if (not.tableView) not.tableView.loadNext();
    }

    not.goToTable = function(e) {
        if(typeof e !== 'undefined' && e !== null && e.hasOwnProperty('preventDefault')) {
            e.preventDefault();
        }
        window.location.hash = 'transport';
        not.rebuildContainer(not.container);
        return false;
    };

    not.bindAddButton = function() {
        document.getElementById('addThis').addEventListener('click', function() {
            not.newItem = not.initItem();
            var form = app._working.forms.common.build({
                actionName: 'new',
                scenario: 'admin',
                formType: 'itemEditForm',
                data: not.newItem,
                afterSubmit: not.goToTable,
                afterRestore: not.goToTable,
                typeLib: app.getOptions().typeLib,
                vehicleClassLib: app.getOptions().vehicleClassLib,
                firmIDLib: not.lib.firms,
                driverIDsLib: not.lib.drivers,

            });
            document.getElementById('formPlace').appendChild(form);
            document.getElementById('formPlace').classList.add('show');
        });
    }

    not.renderForm = function(item){
        var form = app._working.forms.common.build({
            actionName: 'update',
            scenario: 'admin',
            formType: 'itemEditForm',
            data: item,
            afterSubmit: not.goToTable,
            afterRestore: not.goToTable,
            typeLib: app.getOptions().typeLib,
            vehicleClassLib: app.getOptions().vehicleClassLib,
            firmIDLib: not.lib.firms,
            driverIDsLib: not.lib.drivers,
        });
        document.getElementById('formPlace').appendChild(form);
    };


    not.bindEditForm = function(item) {
        not.$render(not, 'edit', item, function() {
            not.model.setAttr('_id', item._id);
            not.model.$getRaw(not.renderForm);
        });
    }

    not.bindViewForm = function(item) {
        var helpers = {
            showVersion: function(item, e) {
                var archiveVersion =document.getElementById('showVersion').value;
                not.model.setAttr('_id', archiveVersion);
                not.model.$get(function(archiveVersion){
                    not.fillDetails('archiveVersion',archiveVersion, document.getElementById('archiveVersion'));
                });
            },
            edit: not.bindEditForm,
            remove: function(titem, e) {
                if(confirm('Удалить запись?')){
                    titem.$delete(function(){
                        window.location.hash = 'transport';
                    });
                }
            },
            getLinkToTable: function(){
                return '/admin#transport';
            },
            viewTitle: 'Транспорт'
        };

        not.$render(not, 'view', item, helpers, function() {
            not.fillDetails('latestVersion', item, document.getElementById('latestVersion'));
            not.fillDetails('archiveVersion', item, document.getElementById('archiveVersion'));
        });
    }

    not.fillDetails = function(viewName, item, putTo) {
        not.$render(not, viewName, item, not.views.details.helpers, function() {});
    };

    not.rebuildContainer = function(el) {
        if(typeof params !== 'undefined' && params !== null && params.length > 0) {
            not.model.setAttr('_id', params);
            not.model.$get(not.bindViewForm);
            params = undefined;
        } else {
            not.$render(not, 'list', null, function(){
                not.bindAddButton();
                document.getElementById('formPlace').classList.remove('show');
                not.loadList();
            });
        }
    };

    not.rebuildContainer();
    $('footer').on('scrollSpy:enter', not.showNextPage);
    $('footer').scrollSpy();
}
