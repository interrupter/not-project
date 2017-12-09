const 	os = require('os'),
	log = require('./libs/log')(module),
	app = require('./app.js'),
	cluster = require('cluster'),
	env = process.env.NODE_ENV || 'development';

log.info('Environment', env);

app();
