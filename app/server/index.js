const env = process.env.NODE_ENV || 'development';
const path = require('path');
const configPath = path.join(__dirname, 'config/'+env+'.json');
const configModule = require('not-config');
//инициализируем доступ к логам
require('not-log')(path.join(__dirname, '../../logs/log'));
const log = require('not-log')(module);
log.info('Environment', env);
//иницилизируем доступ к настройкам
const configLoaded = configModule.init(configPath);

if (configLoaded !== false){
	log.info('Config loaded: ', configPath);
	require('./app.js')();
}else{
	log.error('Config not loaded: ', configPath);
}
