var mongoose = require('./db');

var userSchema = new mongoose.Schema({
	fname: String,
	lname: String,
	password: String,
	email: String,
	head: String
}, {
	collection: 'users'
});

var userModel = mongoose.model('User', userSchema);
	
function User(user) {
	this.fname = user.fname;
	this.lname = user.lname;
	this.password = user.password;
	this.email = user.email;
}

var UserProto = {
	save: function(callback){
		var user = {
			fname: this.fname,
			lname: this.lname,
			password: this.password,
			email: this.email
		};
		var newUser = new userModel(user);
		newUser.save(function (err, user){
			if(err){
				return callback(err);
			}
			callback(null, user);
		});
	},
	get: function(email, callback){
		if(email.length <= 0){
			userModel.find({}, function (err, users){
				callback(null, users);
			});
		}else{
			userModel.findOne({'email': email}, function (err, user){
				if(err){
					return callback(err);
				}
				callback(null, user);
			});
		}
	}
};

User.prototype = UserProto;
module.exports = User;


