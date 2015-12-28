var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var todoSchema = new Schema({
	title: String,
	content: String,
	checker: {
		type: Boolean,
		default: false
	},
	order: Number,
	taskID: {
		type: Schema.Types.ObjectId,
		ref: 'TaskModel'
	},
	duedate: {
		type: Date,
		default: null
	}
});

module.exports = mongoose.model('TodoModel', todoSchema);