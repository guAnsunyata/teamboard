var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var taskSchema = new Schema({
	name: String,
	desc: String,
	createdate: {
		type: Date,
		default: null
	},
	finisheddate: {
		type: Date,
		default: null
	},
	startdate: {
		type: Date,
		default: null
	},
	duedate: {
		type: Date,
		default: null
	},
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