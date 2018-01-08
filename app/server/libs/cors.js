exports.allowCORS = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'uploads 192.168.0.6');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};
