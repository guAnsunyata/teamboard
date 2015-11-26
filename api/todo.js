var TodoModel = require('./model/todoModel.js');

var TodoProto = {
	'create': function(req, callback) {
		var new_todo = new TodoModel({});
		new_todo.save(function (err, todo) {
			if(err) throw err;
			callback(todo);
		})
	},
	'updateTitle': function(req, callback) {
		var query = {_id: req.todo_id};
		TodoModel.update(query, {title: req.title}, function (err, todo) {
			if(todo!=0){
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}else{
				callback(todo);
			}
		})
	},
	'updateContent': function(req, callback) {
		var query = {_id: req.todo_id};
		TodoModel.update(query, {content: req.content}, function (err, todo) {
			if(todo!=0){
				TodoModel.findOne(query, function (err, todo) {
					callback(todo);
				})
			}else{
				callback(todo);
			}
		})
	},
	'findAll': function (req, callback) {
		TodoModel.find({}, function (err, todo) {
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