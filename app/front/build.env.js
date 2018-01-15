let replaceSets = {
	development: {
		ROLLUP_ENV_TIME_TO_LOAD: 10000, //сколько миллисекунд ждем прежде чем отправим пользователя на страницу ROLLUP_ENV_LOCATION_FOR_FAULTY_LOAD_MESSAGE
		ROLLUP_ENV_PORT: 80, //порт сервера редактора
		ROLLUP_ENV_PROTOCOL: 'http' //протокол
	},
	production: {
		ROLLUP_ENV_TIME_TO_LOAD: 60000,
		ROLLUP_ENV_PORT: 3000,
		ROLLUP_ENV_PROTOCOL: 'https'
	},
	stage: {
		ROLLUP_ENV_TIME_TO_LOAD: 30000,
		ROLLUP_ENV_PORT: 8080,
		ROLLUP_ENV_PROTOCOL: 'https'
	},
};

let replacerOpts = {
		ENV: JSON.stringify(process.env.NODE_ENV || 'development')
	},
	baseHost = replacerOpts.ROLLUP_ENV_PORT + '://' + replacerOpts.ROLLUP_ENV_HOST + ':' + replacerOpts.ROLLUP_ENV_PORT;

if (['production', 'stage', 'develpment'].indexOf(process.env.NODE_ENV) > -1) {
	replacerOpts = Object.assign(replacerOpts, replaceSets[process.env.NODE_ENV]);
} else {
	replacerOpts = Object.assign(replacerOpts, replaceSets.development);
}

let babelOn = () => {
	return ['production', 'stage', 'development'].indexOf(process.env.NODE_ENV) > -1;
};

let uglifyOn = () => {
	return ['production'].indexOf(process.env.NODE_ENV) > -1;
};

export {
	babelOn,
	uglifyOn,
	replacerOpts,
	baseHost,
	replaceSets
};
