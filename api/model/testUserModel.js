var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var testUserSchema = mongoose.Schema({
	local: {
		username: String,
		password: String
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		fname: String,
		lname: String,
		link: String
	}
});

testUserSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
}

testUserSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.local.password);
}

module.exports = mongoose.model('UserTest', testUserSchema);