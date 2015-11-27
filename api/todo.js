var TodoModel = require('./model/todoModel.js');
var TaskModel = require('./model/taskModel.js');

var TodoProto = {
	'create': function(req, callback) {
		var new_todo = new TodoModel({
			'title': '新事項',
			'content': '雙擊編輯內容',
			'taskID': req.task_id
		});
		new_todo.save(function (err, todo) {
			if(err) throw err;
			callback(todo);
		});
		// function countTodos(req, thenCreate){
		// 	TodoModel.count({'taskID': req.body.task_id}, function (err, todo) {
		// 		thenCreate(req, todo);
		// 	});
		// }
		// var createTodo = function (req, totalTodo, callback) {
		// 	var new_todo = new TodoModel({
		// 		'title': '',
		// 		'content': '',
		// 		'taskID': req.body.task_id
		// 	});
		// 	new_todo.save(function (err, todo) {
		// 		if(err) {
		// 			console.log(err);
		// 		}else{
		// 			callback(todo);
		// 		}
		// 	})
		// }
		// countTodos(req, createTodo);
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
		TodoModel.update(query, {checker: req.checker}, function (err, todo) {
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
		var query = {_id: req.todo_id};
		TodoModel.update(query, {order: req.order}, function (err, todo) {
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
		TodoModel.find({'_id': req.body.id}, function (err, todo) {
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
		TodoModel.remove({'_id': req.body.id}, function (err, todo) {
			if(err) throw err;
			callback(todo);
		})
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