var mongoose = require('mongoose');

//mongodb connection
var mongolab_db = 'mongodb://admin:admin@ds057234.mongolab.com:57234/teamboard-dev';
//var mongolab_db = 'mongodb://admin:admin@ds043971.mongolab.com:43971/teamboard-dev-heroku';
var localhost_db = 'mongodb://localhost:27017/teamboard';



mongoose.connect(mongolab_db, function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

module.exports = mongoose;
