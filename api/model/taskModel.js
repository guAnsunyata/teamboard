var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var taskSchema = new Schema({
	name: String,
	desc: String,
	startdate: Date,
	duedate: Date,
	leader: String,
	collabs: [ Schema.Types.ObjectId ],
	finished: {
		type: Boolean,
		default: false
	},
	todos: [{ 
		type: Schema.Types.ObjectId,
		ref: 'TodoModel'
	}],
	projectID: {
		type: Schema.Types.ObjectId,
		ref: 'ProjectModel'
	}
});

module.exports = mongoose.model('TaskModel', taskSchema);