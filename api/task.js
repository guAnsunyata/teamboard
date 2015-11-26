var TaskModel = require('./model/taskModel.js');

var TaskProto = {
	'create': function(req, callback) {
		var new_task = new TaskModel({
				name: req.body.name,
				desc: req.body.desc,
				startdate: req.body.startdate,
				duedate: req.body.duedate,
				leader: req.body.leader,
				collabs: req.body.collabs
				// ,projectID: req.body.proj_id
			});
		new_task.save(function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'createAtOnce': function(req, callback) {
		var new_task = new TaskModel({projectID: req.proj_id});
		new_task.save(function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'findAll': function (req, callback) {
		TaskModel.find({'id':req.body.id}, function (err, task) {
			if(err) throw err;
			callback(task);
		})
	},
	'updateName': function(req, callback) {
		var query = {_id: req.body.task_id};
		TaskModel.update(query, {name: req.body.name}, function (err, task) {
			// if(err) throw err;
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