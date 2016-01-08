var TodoModel = require('./model/todoModel.js');
var TaskModel = require('./model/taskModel.js');

var TodoProto = {
	'temp': function(id, callback) {
		TodoModel.update({_id: id}, {})
	},
	'assign': function(req, callback) {
		var req = req.body;
		var query = {
			_id: req.todo_id
		};
		TodoModel.update(query, {collabs: req.collabs}, function (err, todo) {
			callback(todo);
		});
	},
	'getCollabs': function(req,callback) {
		var req = req.body;
		var query = {
			_id: req.todo_id
		};
		TodoModel.findOne(query).select('collabs').exec(function (err, todo) {
			if (typeof(todo.collabs)=='undefined') {
				callback([]);
			} else {
				callback(todo.collabs);
			}
		});
	},
	'create': function(req, callback) {
		// step 1: get order of this todo
		TodoModel.count({'taskID': req.task_id}, function (err, todo) {
			// step 2: create this todo
			var current_date = new Date();
			var new_todo = new TodoModel({
				'title': '新事項',
				'content': '雙擊編輯內容',
				'order': todo,
				'taskID': req.task_id,
				'createdate': current_date,
				'duedate': undefined
			});
			new_todo.save(function (err, todo) {
				if(err) throw err;
				callback(todo);
			});
		});
	},
	'updateTitle': function(req, callback) {
		var query = {_id: req.todo_id};
		TodoModel.update(query, {title: req.title}, function (err, todo) {
			if(err){
				console.log(err);
			}else{
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}
		})
	},
	'updateContent': function(req, callback) {
		var query = {_id: req.todo_id};
		TodoModel.update(query, {content: req.content}, function (err, todo) {
			if(err) {
				console.log(err);
			}else{
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}
		})
	},
	'updateChecker': function(req, callback) {
		var query = {_id: req.todo_id};
		var current_date = new Date();
		var updatedata = {
			checker: req.checker
		};
		if(updatedata.checker){
			updatedata.finisheddate = current_date;
		}else{
			updatedata.finisheddate = undefined;
		}
		// typeof(req.yo)=='undefined'
		TodoModel.update(query, updatedata, function (err, todo) {
			if(err) {
				console.log(err);
			}else{
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}
		})
	},
	'updateOrder': function(req, callback) {
		// step 1: get task id of this todo
		// step 2: change order
		var query = {_id: req.todo_id};
		TodoModel
			.findOne(query)
			.select('taskID')
			.exec(function (err, todo) {
				if(err) throw err;
				var imTaskID = todo.taskID;
				if(req.before > req.after){
					TodoModel.update(
						{taskID: imTaskID, order: {$gte: req.after, $lt: req.before}},
						{$inc: {order: +1}},
						{multi: true},
						function (err, todo){
							if(err) throw err;
							TodoModel.update(query, {order: req.after}, function (err, todo){
								if(err) throw err;
								TaskModel
									.findOne({_id: imTaskID})
									.populate('todos')
									.exec(function (err, task) {
										if(err) throw err;
										callback(task);
								});
							});
					});
				}else if(req.before < req.after){
					TodoModel.update(
						{taskID: imTaskID, order: {$gt: req.before, $lte: req.after}},
						{$inc: {order: -1}},
						{multi: true},
						function (err, todo){
							if(err) throw err;
							TodoModel.update(query, {order: req.after}, function (err, todo){
								if(err) throw err;
								TaskModel
									.findOne({_id: imTaskID})
									.populate('todos')
									.exec(function (err, task) {
										if(err) throw err;
										callback(task);
								});
							});
					});
				}else{}
		});
	},
	'updateDuedate': function (req, callback) {
		var query = {_id: req.todo_id};
		TodoModel.update(query, {duedate: req.duedate}, function (err, todo) {
			if(err) {
				console.log(err);
			}else{
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}
		})
	},
	'findAll': function (req, callback) {
		TodoModel.find({taskID: req.body.task_id}, function (err, todo) {
			if(err) throw err;
			callback(todo);
		})
	},
	'find': function (req, callback) {
		TodoModel.find({}, function (err, todo) {
			if(err) throw err;
			callback(todo);
		})
	},
	'update': function(req, callback) {
		var query = { '_id': req.body.id }
		TodoModel.update(query, { $set: 
			{ 	'title': req.body.title,
				'content': req.body.content,
				'collabs': req.body.collabs }}, function (err, todo) {
			if(err) throw err;
			callback(todo);
		});
	},
	'delete': function (req, callback) {
		// find task id
		TodoModel.findOne({_id: req.todo_id}, function (err, todo) {
			var query = {
				taskID: todo.taskID,
				order: {$gt: todo.order}
			}
			var query2 = {
				_id: todo.taskID
			}
			// order of todo minus 1, if it's queueing behind the todo that is gonna delete
			TodoModel.update(query, {$inc: {order: -1}}, {multi: true}, function (err, todo) {
				// delete todo
				TodoModel.remove({_id: req.todo_id}, function (err, todo) {
					// $pull todo id in the task documents
					TaskModel.update(query2, {$pull: {todos: req.todo_id}}, function (err, task) {
						// find todo of the task as return data
						TaskModel.findOne(query2, function (err, task) {
							callback(task.todos);
							console.log(task.todos);
						})
					})
				})
			})
		});
	},
	'deleteAll': function(req, callback) {
		TodoModel.remove({}, function (err, todo) {
			if(err) throw err;
			callback(todo);
		})
	}
}

function Todo() {
	// initial ...
};
Todo.prototype = TodoProto;

module.exports = Todo;

// var id = todo._id;
// TodoModel.update({'_id':id}, {$pushAll: {test: req.test}}, function (err, todo){
// 	if(err) throw err;
// 	callback(todo._id);
// })