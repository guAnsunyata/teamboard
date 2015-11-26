var mongoose = require('mongoose');

//mongodb connection
var mongolab_db = 'mongodb://admin:admin@ds057234.mongolab.com:57234/teamboard-dev';
var localhost_db = 'mongodb://localhost:27017/teamboard';

mongoose.settings = {
	cookieSecret: 'patchwork',
	db: 'teamboard',
	host: 'localhost',
	port: 27017
};

mongoose.connect(mongolab_db, function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

module.exports = mongoose;