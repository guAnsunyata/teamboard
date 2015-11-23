var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var projectSchema = new Schema({
	name: String,
	desc: String,
	startdate: Date,
	duedate: Date,
	status: String,
	members: [{
		type: Schema.Types.ObjectId,
		ref: 'TaskModel'
	}]
});

module.exports = mongoose.model('ProjectModel', projectSchema);