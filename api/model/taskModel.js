var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var taskSchema = new Schema({
	name: String,
	desc: String,
	startdate: Date,
	duedate: Date,
	leader: String,
	collabs: [ Schema.Types.ObjectId ],
	finish: {
		type: Boolean,
		default: false
	},
	todos: [{ order: Number, todoID: Schema.Types.ObjectId }],
	projectID: {
		type: Schema.Types.ObjectId,
		ref: 'ProjectModel'
	}
});

module.exports = mongoose.model('TaskModel', taskSchema);