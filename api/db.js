var mongoose = require('mongoose');


mongoose.settings = {
	cookieSecret: 'patchwork',
	db: 'teamboard',
	host: 'localhost',
	port: 27017
};

//mongodb connection
mongoose.connect('mongodb://localhost:27017/teamboard', function(err){
	if(err){
		console.log(err);
	} else{
		console.log('Connected to mongodb!');
	}
});

module.exports = mongoose;
