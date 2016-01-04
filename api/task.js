var ProjectModel = require('./model/projectModel.js');
var TaskModel = require('./model/taskModel.js');
var TodoModel = require('./model/todoModel.js');
var UserTest = require('./model/testUserModel.js');

var TaskProto = {
	'temp': function (req, callback) {

		// TaskModel.update(
		// 	{_id:'5655a784dbb681cc10b5f03d'},
		// 	{$pushAll: {collabs: ['568a6d6d121228bd7d32a82c']}},
		// 	function (err, task) {
		// 		callback(task);
		// })

	},
	// get name of the collaborators
	'findbyid': function (req, callback) {
		var query = {
			_id: req.body.task_id
		}
		TaskModel
		.findOne(query)
		.select('collabs')
		.populate({
			path: 'collabs',
			select: 'facebook.name',
			model: 'UserTest'
		})
		.exec(function (err, task) {
			callback(task);
		});
	},
	'create': function(req, callback) {
		var current_date = new Date();
		var new_task = new TaskModel({
			// 'name': req.body.name,
			// 'desc': req.body.desc,
			// 'leader': req.body.leader,
			// 'collabs': req.body.collabs,
			'createdate': current_date,
			'projectID': req.body.proj_id
		});
		var query = {
			_id: req.body.proj_id
		};
		new_task.save(function (err, task) {
			if(err) throw err;
			ProjectModel.update(query, {$pushAll: {tasks: [task._id]}}, function (err, proj) {
				ProjectModel.findOne(query, function (err, proj) {
					callback(proj);
				});
			});
			// callback(task);
		})
	},
	'createAtOnce': function(req, callback) {
		var new_task = new TaskModel({projectID: req.proj_id});
		new_task.save(function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'findAll': function(req, callback) {
		TaskModel.find({'projectID': req.body.proj_id}, function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'getCount': function(req, callback) {
		TaskModel
		.find({'projectID': req.body.proj_id})
		.populate('todos')
		.exec(function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'pushTodoID': function(req, callback) {
		var query = {_id: req.task_id}
		TaskModel.update(query, {$pushAll: {todos: [req.todo_id]}}, function (err, task) {
			if(err) {
				console.log(err);
			}else{
				TaskModel.find(query, function (err, task) {
					if(err) {
						console.log(task)
					}else{
						callback(task);
					}
				})
			}
		})
	},
	'updateName': function(req, callback) {
		var query = {_id: req.body.task_id};
		TaskModel.update(query, {name: req.body.name}, function (err, task) {
			if(err) throw err;
			if(task!=0){
				callback('update succeeded');
			}else{
				callback('failed');
			}
		})
	},
	'updateDescription': function (req, callback) {
		var query = {_id: req.task_id};
		TaskModel.update(query, {name: req.desc}, function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'update': function(req, callback) {
		var query = { '_id': req.body.id }
		TaskModel.update(query, { $set: 
			{ 	'name': req.body.name,
				'desc': req.body.desc,
				'startdate': req.body.startdate,
				'duedate': req.body.duedate,
				'leader': req.body.leader,
				'collabs': req.body.collabs,
				'status': req.body.status,
				'todos': req.body.todos,
				'content': req.body.content }}, function (err, task) {
			if(err) throw err;
			callback(task);
		});
	},
	'tryPull': function(req, callback) {
		var query = { '_id': '5655a94e5abde1080f059588' }
		TaskModel.update(
			query,
			{todos: []},
			function (err, task) {
				if(err) throw err;
				TaskModel.find({}, function (err, task) {
					if(err) throw err;
					callback(task);
				})
		})
	},
	'delete': function(req, callback) {
		var taskID = req.body.task_id;
		TaskModel.findOne({_id: taskID}, function (err, task) {
			var projID = task.projectID;
			TaskModel.remove({_id: taskID}, function (err, task) {
				ProjectModel.update({_id: projID}, {$pull: {tasks: taskID}}, function (err, proj) {
					ProjectModel.findOne({_id: projID}, function (err, proj) {
						callback(proj);
					});
				});
			});
		})
	},
	'deleteAll': function (req, callback) {
		TaskModel.remove({}, function (err, task) {
			if(err) throw err;
			callback(task);
		})
	}
}

function Task() {
	// initial ...
};

Task.prototype = TaskProto;

module.exports = Task;