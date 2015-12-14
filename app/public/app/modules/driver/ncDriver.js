var ncDriver = function(app, params) {
    console.log('running ncDriver controller');
    var not = this;
    not.viewsPrefix = '/app/modules/driver/';
    not.commonViewsPrefix = app.getOptions().commonPath;
    not.containerId = 'page-wrapper';
    not.container = document.getElementById(not.containerId);
    not.viewsPostfix = '.html';
    not.renderFromURL = true;
    not.tableView = null;
    not.collection = jQuery.extend(true, {}, not.nrDriver);
    not.model = jQuery.extend(true, {}, not.nrDriver);

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
                FIO: function(item, index) {
                    return [item.fName, item.iName, item.oName].join(' ');
                },
                openCategories: function(item, index) {
                    return item.openCategories.join(', ');
                },
                status: function(item, index) {
                    return item.status ? 'Свободен' : 'Занят';
                },
                transportList: function(item, index) {
                    var list = '';
                    if(item.transportIDs instanceof Array) {
                        for(var i = 0; i < item.transportIDs.length; i++) {
                            list += '<li><a href="/admin#transport/' + item.transportIDs[i]._id + '">' + [item.transportIDs[i].transportID, item.transportIDs[i].brand, item.transportIDs[i].model, item.transportIDs[i].registrationNumber].join(' ') + '</a></li>';
                        }
                    }
                    return list;
                },
                firmID: function(titem, index) {
                    return [titem.firmID.firmID, titem.firmID.title].join(' - ');
                },
                photoSrc: function(titem) {
                    return '/photos/' + titem.photo;
                }
            }
        },

    };

    not.lib = {

    };

    not.nrFirm.$listAll(function(data) {
        not.lib.firms = data;
    });

    not.nrTransport.$listAll(function(data) {
        for(var i = 0; i < data.length; i++) {
            data[i].title = [data[i].transportID, data[i].brand, data[i].model, data[i].registrationNumber].join(' ');
        }
        not.lib.transports = data;
    });

    not.initItem = function() {
        var newRecord = jQuery.extend(true, {}, not.nrDriver);
        newRecord.setAttrs({
            '_id': null,
            fName: ''
        });
        return newRecord;
    }

    not.updateDatatable = function(data) {
        not.tableView = new notTable({
            templateUrl: '/app/common/table.html',
            place: document.getElementById('tablePlace'),
            helpers:{
                tableTitle: 'Водители'
            },
            headerTitles: [{
                title: 'ID',
                field: 'driverID',
                sortable: true
            }, {
                field: 'fName',
                title: 'Фамилия',
                sortable: true
            }, {
                field: 'iName',
                title: 'Имя',
                sortable: true
            }, {
                field: 'oName',
                title: 'Отчество',
                sortable: true
            }, {
                field: 'licenseID',
                title: 'Номер ВУ'
            }, {
                field: 'phone',
                title: 'Номер Тел.',
                proccessor: function(value, item, index) {
                    return value.join(',');
                }
            }, {
                field: '_id',
                title: 'Действия',
                proccessor: function(value, item, index) {
                    return '<a href="/admin#driver/' + value + '">Смотреть</a>';
                }
            }],
            data: data,
            procRow: function(rowElement, rowItem) {
                if(rowItem.status) {
                    rowElement.classList.add('success');
                } else {
                    rowElement.classList.add('danger');
                }
                return rowElement;
            },
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

    not.showNextPage = function() {
        if (not.tableView) not.tableView.loadNext();
    }

    not.goToTable = function(e) {
        if(typeof e !== 'undefined' && e !== null && e.hasOwnProperty('preventDefault')) {
            e.preventDefault();
        }
        window.location.hash = 'driver';
        not.rebuildContainer(this.container);
        return false;
    };

    not.bindAddButton = function() {
        document.getElementById('addThis').addEventListener('click', function() {
            document.getElementById('formPlace').innerHTML = '';
            not.newItem = not.initItem();
            var form = app._working.forms.common.build({
                actionName: 'new',
                scenario: 'admin',
                formType: 'itemEditForm',
                data: not.newItem,
                afterSubmit: not.goToTable,
                afterRestore: not.goToTable,
                openCategoriesLib: app.getOptions().vehicleClassLib,
                firmIDLib: not.lib.firms,
                transportIDsLib: not.lib.transports,
                statusLib: app.getOptions().statusLib,
            });
            document.getElementById('formPlace').appendChild(form);
            document.getElementById('formPlace').classList.add('show');
        });
    }

    not.renderForm = function(item) {
        document.getElementById('formPlace').innerHTML = '';
        item.dateOfBirth = item.dateOfBirth.substring(0, 10);
        item.licenseTill = item.licenseTill.substring(0, 10);
        var form = app._working.forms.common.build({
            actionName: 'update',
            scenario: 'admin',
            formType: 'itemEditForm',
            data: item,
            afterSubmit: function() {
                not.goToTable();
            },
            afterRestore: not.goToTable,
            openCategoriesLib: app.getOptions().vehicleClassLib,
            firmIDLib: not.lib.firms,
            transportIDsLib: not.lib.transports,
            statusLib: app.getOptions().statusLib,
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
        item.dateOfBirth = item.dateOfBirth.substring(0, 10);
        item.licenseTill = item.licenseTill.substring(0, 10);
        var helpers = {
            showVersion: function(item, e) {
                var archiveVersion =  document.getElementById('showVersion').value;
                not.model.setAttr('_id', archiveVersion);
                not.model.$get(function(archiveVersion) {
                    not.fillDetails('archiveVersion',archiveVersion,  document.getElementById('archiveVersion'));
                });
            },
            edit: not.bindEditForm,
            remove: function(titem, e) {
                if(confirm('Удалить запись?')) {
                    titem.$delete(function() {
                        window.location.hash = 'driver';
                    });
                }
            },
            getLinkToTable: function(){
                return '/admin#driver';
            },
            viewTitle: 'Водители'
        };
        not.$render(not, 'view', item, helpers, function() {
            not.fillDetails('latestVersion', item, document.getElementById('latestVersion'));
            not.fillDetails('archiveVersion', item, document.getElementById('archiveVersion'));
        });
    }

    not.fillDetails = function(viewName, item, putTo) {
        item.dateOfBirth = item.dateOfBirth.substring(0, 10);
        item.licenseTill = item.licenseTill.substring(0, 10);
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
