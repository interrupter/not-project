var express = require('express');
var expressSession = require('express-session');
var serveFavicon = require('serve-favicon');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var mongoose = require('./libs/mongoose');

var http = require('http');
var path = require('path');
var config = require('./config');
var HttpError = require('not-node').Error.Http;
var log = require('./libs/log')(module);
//обновляем описание интерфейсов, по которым работают клиент-сервер
//будут использоваться на клиенте для генерации ORM моделей доступа
//автогенерации форм и их валидации на стороне клиента
//на сервере будут использованы для обработки входящих запросов

config.set('interfaceManifests', (require('not-node').Manifest.updateManifests(__dirname+'/routes')));

var app = express();
app.use(methodOverride());
app.engine('ejs', require('ejs-locals'));
app.set('port', process.env.PORT || config.get('port'));
app.set('views', __dirname + '/views');
app.set('routes', __dirname + '/routes');
app.set('view engine', 'ejs');
//app.use(serveFavicon(__dirname + '/public/icon.ico'));

if (app.get('env') == 'development'){
    app.use(morgan('dev'));
}else{
    app.use(morgan('combined'));
}

var i18n = require('i18n-abide');

app.use(i18n.abide({
  supported_languages: ['en-US', 'de', 'es', 'zh-TW'],
  default_lang: 'en-US',
  translation_directory: 'static/i18n'
}));

//app.use(bodyParser.urlencoded({ extended: false, limit: '50mb'}));
//app.use(bodyParser.json({limit: '50mb'}));


app.use(cookieParser());
config.set('publicDir', __dirname + '/public');
config.set('appDir', __dirname+'/');
app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/savePhoto'));

var MongoStore = require('connect-mongo')(expressSession);

app.use(expressSession({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(require('./middleware/loadUser'));

var routes = require('./routes')(app);

app.use(serveStatic(path.join(__dirname, 'public')));
app.use('/adminApp', [ checkAuthAdmin, serveStatic(path.join(__dirname, 'public', 'adminApp')) ] );

app.use(function(req, res){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
    return;
});

app.use(function(err, req, res){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
    return;
});

http.createServer(app).listen(app.get('port'), function(){
    log.info('Express server listening on port ' + app.get('port'));
});


/*

!TODO:20 continuos loading firm

!TODO:60 deletion of firm

!TODO:80 view page for firm

*/
