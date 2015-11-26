var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var todoSchema = new Schema({
	title: String,
	content: String,
	collabs: [ Schema.Types.ObjectId ],
	finished: {
		type: Boolean,
		default: false
	},
	taskID: {
		type: Schema.Types.ObjectId,
		ref: 'TaskModel'
	}
});

module.exports = mongoose.model('TodoModel', todoSchema);