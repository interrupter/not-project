const auth = require('not-node').Auth,
	config = require('not-config').reader,
	siteRouter = require('./site');

module.exports = function (app, notApp) {
	//можно запросить манифест для клиент-серверного обмена
	app.get('/api/manifest', function (req, res, next) {
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
		res.header('Expires', '-1');
		res.header('Pragma', 'no-cache');
		res.json(notApp.getManifest());
	});
	//
	app.get('', siteRouter.index);
};
