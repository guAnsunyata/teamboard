var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var projectSchema = new Schema({
	name: String,
	desc: String,
	startdate: Date,
	duedate: Date,
	status: String,
	members: [{
		type: Schema.Types.ObjectID,
		ref: 'TaskModel'
	}]
});

module.exports = mongoose.module('ProjectModel', projectSchema);