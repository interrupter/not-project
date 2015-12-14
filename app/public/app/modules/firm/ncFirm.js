var ncFirm = function(app, params) {
    console.log('register ncFirm', this);
    var not = this;
    not.viewsPrefix = '/app/modules/firm/';
    not.commonViewsPrefix = app.getOptions().commonPath;
    this.containerId = 'page-wrapper';
    this.container = document.getElementById('page-wrapper');
    this.viewsPostfix = '.html';
    this.renderFromURL = true;
    not.collection = jQuery.extend(true, {}, not.nrFirm);
    not.model = jQuery.extend(true, {}, not.nrFirm);
    not.tableView = null;
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
        details: {}
    };

    not.initItem = function() {
        var newRecord = jQuery.extend(true, {}, not.nrFirm);
        newRecord.setAttrs({
            '_id': null,
            title: 'Фирма'
        });
        return newRecord;
    }

    not.updateDatatable = function(data) {
        not.tableView = new notTable({
            templateUrl: '/app/common/table.html',
            place: document.getElementById('tablePlace'),
            helpers:{
                tableTitle: 'Фирмы'
            },
            headerTitles: [{
                title: 'ID',
                field: 'firmID',
                sortable: true
            }, {
                field: 'title',
                title: 'Название',
                sortable: true
            }, {
                field: '_id',
                title: 'Действия',
                proccessor: function(value, item, index) {
                    return '<a href="/admin#firm/' + value + '">Смотреть</a>';
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
        if (not.tableView) not.tableView.loadNext();
    }

    not.goToTable = function(e){
        if (typeof e !== 'undefined' && e !== null && e.hasOwnProperty('preventDefault')){
            e.preventDefault();
        }
        window.location.hash = 'firm';
        not.$render(not, 'view', null, not.rebuildContainer);
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
                afterRestore: not.goToTable
            });
            document.getElementById('formPlace').appendChild(form);
            document.getElementById('formPlace').classList.add('show');
        });
    }

    not.renderForm = function(item) {
        document.getElementById('formPlace').innerHTML = '';
        var form = app._working.forms.common.build({
            actionName: 'update',
            scenario: 'admin',
            formType: 'itemEditForm',
            data: item,
            afterSubmit: function() {
                not.goToTable();
            },
            afterRestore: not.goToTable,
        });
        document.getElementById('formPlace').appendChild(form);
    };


    not.bindEditForm = function(item) {
        not.$render(not, 'edit', item, function() {
            not.model.setAttr('_id', item._id);
            not.model.$get(not.renderForm);
        });
    }

    not.bindViewForm = function(item) {
        var helpers = {
            showVersion: function(item, e) {
                var archiveVersion =document.getElementById('showVersion').value;
                not.model.setAttr('_id', archiveVersion);
                not.model.$get(function(archiveVersion){
                    not.fillDetails('archiveVersion', archiveVersion, document.getElementById('archiveVersion'));
                });
            },
            edit: not.bindEditForm,
            remove: function(titem, e) {
                if(confirm('Удалить запись?')){
                    titem.$delete(function(){
                        window.location.hash = 'firm';
                    });
                }
            },
            getLinkToTable: function(){
                return '/admin#firm';
            },
            viewTitle: 'Фирмы'
        };
        not.$render(not, 'view', item, helpers, function() {
            not.fillDetails('latestVersion', item, document.getElementById('latestVersion'));
            not.fillDetails('archiveVersion', item, document.getElementById('archiveVersion'));
        });
    }

    not.fillDetails = function(viewName, item, putTo) {
        not.$render(not, viewName, item, function() {});
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
