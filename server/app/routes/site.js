var HttpError = require('not-node').Error.Http,
	config = require('../config'),
	log = require('../libs/log')(module);

exports.index = function (req, res) {
	log.debug(req.user);
	let layout = 'site';
	if (req.user) {
		if (req.user.role.indexOf('root') > -1) {
			layout = 'admin';
		} else {
			if (req.user.role.indexOf('client') > -1) {
				layout = 'client';
			}
		}
	}
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	log.debug('layouts/' + layout);
	res.render('layouts/' + layout, {
		title: config.get('lang:ru:title'),
		themePath: config.get('path:theme'),
		bowerPath: config.get('path:bower'),
		host: config.get('fullServerName'),
		rand: Math.random(),
		appPath: config.get('path:app')
	});
};
