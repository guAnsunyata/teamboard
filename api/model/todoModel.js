var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var todoSchema = new Schema({
	title: String,
	content: String,
	test: [{user: String}],
	collabs: [ Schema.Types.ObjectId ],
	finish: Boolean,
	taskID: {
		type: Schema.Types.ObjectId,
		ref: 'TaskModel'
	}
});
module.exports = mongoose.model('TodoModel', todoSchema);