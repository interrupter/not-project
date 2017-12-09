const express = require('express'),
	expressSession = require('express-session'),
	methodOverride = require('method-override'),
	serveStatic = require('serve-static'),
	http = require('http'),
	https = require('https'),
	path = require('path'),
	winston = require('winston'),
	mongoose = require('mongoose'),
	helmet = require('helmet'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	notNode = require('not-node'),
	notAppConstructor = notNode.notApp,
	notStore = require('not-store'),
	config = require('./config'),
	log = require('./libs/log')(module);

var	expressApp,
	notApp;

let initFileStore = function(input, options = {}){
	let storeConfig = input,
		pathToData = path.join(__dirname, storeConfig.root),
		pathToTmp = path.join(__dirname, storeConfig.tmp);
	config.set('pathToData', pathToData);
	if (storeConfig.buckets){
		for(let bucketName in storeConfig.buckets){
			let bucket = storeConfig.buckets[bucketName];
			let store = new notStore[bucket.driver]({
				root: path.join(pathToData, bucketName),
				uriRoot: path.join(storeConfig.uriRoot, bucketName),
				tmp: pathToTmp,
				thumbs: bucket.thumbs || options.thumbs
			});
			notStore.notStore.addInterface(bucketName, store);
		}
	}
};

let initServerEnv = function(){
	let fullServerName = ((config.get('proxy:secure') == 'true') ? 'https' : 'http') + '://' + config.get('host') + ':' + (config.get('proxy:port') || config.get('port'));
	config.set('staticPath', path.join(__dirname, config.get('path:static') || 'static'));
	config.set('modulesPath', path.join(__dirname, config.get('path:modules') || 'modules'));
	config.set('appPath', __dirname);
	config.set('fullServerName', fullServerName);
};

let initServerApp = function(){
	expressApp = express(),
	expressApp.use(helmet());
	notApp = new notAppConstructor({
		mongoose: mongoose
	}).importModulesFrom(config.get('modulesPath'));

	expressApp.use(bodyParser.json({
		limit: '150mb'
	})); // for parsing application/json
	expressApp.use(bodyParser.urlencoded({
		limit: '150mb',
		extended: true
	})); // for parsing application/x-www-form-urlencode
	expressApp.use(methodOverride());
};

let initMongoose = function(input){
	mongoose.Promise = global.Promise;
	mongoose.connect(input.uri, input.options)
		.catch(log.error);
	notNode.Increment.init(mongoose);
};

let initTemplateEngine = function(input = {views: 'views', engine:'pug'}){
	expressApp.set('views', path.join(__dirname, input.views));
	expressApp.set('view engine', input.engine);
};

let initUserSessions = function(){
	var MongoStore = require('connect-mongo')(expressSession);
	expressApp.use(expressSession({
		secret: config.get('session:secret'),
		key: config.get('session:key'),
		cookie: config.get('session:cookie'),
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({
			mongooseConnection: mongoose.connection
		})
	}));
};

let initCORS = function(input){
	var whitelist = input;
	var corsOptions = {
		origin: function (origin, callback) {
			log.debug(origin);
			var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
			callback(null, originIsWhitelisted);
		},
		credentials: true
	};
	expressApp.use(cors(corsOptions));
};

let startup = function(){
	if (config.get('ssl:enabled') === 'true') {
		expressApp.set('protocol', 'https');
		let options = {
			key: fs.readFileSync(config.get('ssl:keys:private')),
			cert: fs.readFileSync(config.get('ssl:keys:cert')), //fullchain
			ca: fs.readFileSync(config.get('ssl:keys:chain'))
		};
		let server = https.createServer(options, expressApp);
		server.listen(config.get('port'), function () {
			log.info('!Project server listening on port ' + config.get('port') + '. For secure connections.');
		});
	} else {
		expressApp.set('protocol', 'http');
		http.createServer(expressApp).listen(config.get('port'), function () {
			log.info('!Project server listening on port ' + config.get('port'));
		});
	}
};

let initMiddleware = function(input){
	if (input){
		for (let ware in input){
			if (ware){
				let warePath = input[ware].path || ware,
					proc;
				if (require(warePath).getMiddleware){
					proc = require(warePath).getMiddleware(input[ware]);
				}else if(require(warePath).middleware){
					proc = require(warePath).middleware;
				}else{
					proc = require(warePath);
				}
				expressApp.use(proc);
			}
		}
	}
};

let serveFront = function (req, res, next) {
	let rolesPriority = config.get('user:roles:priority') || ['root', 'admin', 'client', 'user', 'guest'],
		frontAppRoot = config.get('path:front'),
		frontApp = path.join(frontAppRoot, 'guest');
	if (req.user) {
		for(let role of rolesPriority){
			if (req.user.role.indexOf(role) > -1){
				frontApp = path.join(frontAppRoot, role);
				break;
			}
		}
	}
	return serveStatic(path.join(__dirname, frontApp))(req, res, next);
};

let initExposeRoutes = function(){
	notApp.expose(expressApp);
	require('./routes')(expressApp, notApp);
	expressApp.use(serveStatic(config.get('staticPath')));
	//доступ к админке
	expressApp.use('/front', serveFront);
};

module.exports = function () {
	initServerEnv();
	initFileStore(config.get('store'));
	initMongoose(config.get('mongoose'));
	initServerApp();
	initTemplateEngine(config.get('template'));
	initCORS(config.get('cors'));
	initMiddleware(config.get('middleware'));
	initExposeRoutes();
	//startup server
	startup();
};
