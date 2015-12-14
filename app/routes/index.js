var checkAuth = require('not-node').Auth.checkUser,
    checkAuthAdmin = require('not-node').Auth.checkAdmin,
    manifest = require('not-node').Manifest,
    config = require('../config');

module.exports = function(app) {
    //можно запросить манифест для клиент-серверного обмена
    app.get('/api/manifest', function(req, res, next) {
        res.json(config.get('interfaceManifests'));
    });
    //вывод страницы приложения пользователя, только эти возвращают html
    app.get('/', require('./site').main);
    app.get('/index', require('./site').main);
    app.get('/admin', checkAuthAdmin, require('./admin').main);

    //регистрируем пути по манифесту
    manifest.registerRoutes(app, config.get('interfaceManifests'));
}
