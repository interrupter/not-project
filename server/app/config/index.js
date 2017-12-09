var nconf = require('nconf'),
	path = require('path');

nconf.argv().env('__').file({
	file: path.join(__dirname, 'options.json')
});

console.log('ssl enabled', nconf.get('ssl:enabled'));

module.exports = nconf;
