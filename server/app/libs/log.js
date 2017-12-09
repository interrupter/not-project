const winston = require('winston'),	
	path = require('path'),
	ENV = process.env.NODE_END;

require('winston-daily-rotate-file');

function getLogger(module) {
	let transports = [],
		pathLabel = module.filename.split('/').slice(-2).join('/'),
		logsPath = path.join(__dirname, '../../', 'logs', 'log');
	transports.push(new winston.transports.Console({
		colorize: true
	}));

	transports.push(new winston.transports.DailyRotateFile({
		name: 'file',
		datePattern: '.yyyy-MM-dd',
		filename: logsPath,
		level: ENV === 'production' ? 'error' : 'debug',
		json: true,
		label: pathLabel
	}));

	return new winston.Logger({
		transports: transports
	});

}
module.exports = getLogger;
