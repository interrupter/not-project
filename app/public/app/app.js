$(function() {
    (new notApp({
        //url from which will take interfaceManifest json file
        interfaceManifestURL: '/api/manifest',
        //routes for client-side
        siteManifest: {
            //routie route desription: controller name, real controller is function preffixed with 'nc', ncMain, ncPublication
            '': 'main',
            'firm/:param?': 'firm',
            'transport/:param?': 'transport',
            'driver/:param?': 'driver'
        },
        //base controller, executed on every site page before any other controller
        initController: 'init',
        //form auto generation
        forms: {
            //common is for profile
            //associated object is options for generator object
            //default generator notForm
            common: {
                templateUrl: '/app/common/elements.html'
            }
        },
        options: {
            scrollSize: 30,
            commonPath: '/app/common/',
            statusLib: [
                {
                    '_id': true,
                    'title': 'Свободен'
                }, {
                    '_id': false,
                    'title': 'Занят'
                }
            ],
            typeLib: [{
                '_id': 'машина',
                'title': 'Машина'
            }, {
                '_id': 'минивен',
                'title': 'Минивен'
            }, {
                '_id': 'автобус',
                'title': 'Автобус'
            }],
            vehicleClassLib: [{
                '_id': 'a',
                'title': 'A'
            }, {
                '_id': 'b',
                'title': 'B'
            }, {
                '_id': 'c',
                'title': 'C'
            }, ]
        }
    })).exec();
});
