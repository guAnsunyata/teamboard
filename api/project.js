var ProjectModel = require('./model/projectModel.js');
var TaskModel = require('./model/taskModel.js');
var TodoModel = require('./model/todoModel.js');

var ProjectProto = {
	//最殘的create
	'create': function(req, callback) {
		var current_date = new Date();
		var new_project = new ProjectModel({
			name: req.body.name,
			desc: req.body.desc,
			startdate: current_date
		});
		new_project.save(function (err, project){
			if(err) throw err;
			callback(project);
		})
	},
	'find': function(req, callback) {
		ProjectModel.findOne({'_id': req.body.proj_id}, function (err, project) {
			if(err) throw err;
			callback(project);
			// Date.prototype.addDays = function(days) {
			//     this.setDate(this.getDate() + parseInt(days));
			//     return this;
			// };
			// var current_date = new Date();
			// var due_date = new Date();
			// due_date.addDays(10);

			// ProjectModel.update({'_id': req.body.proj_id}, 
			// 	{
			// 		startdate: current_date, 
			// 		duedate: due_date
			// 	}, function (err, project) {
			// 		callback(proj_idect);
			// })
		})
	},
	'updateName': function(req, callback) {
		var query = {'_id': req.body.proj_id}
		ProjectModel.update(query, {'name': req.body.name}, function (err, proj) {
			if(err){
				console.log(err);
			}else{
				callback(proj);
			}
		})
	},
	'updateDesc': function(req, callback) {
		var query = {'_id': req.body.proj_id}
		ProjectModel.update(query, {'desc': req.body.desc}, function (err, proj) {
			if(err){
				console.log(err);
			}else{
				callback(proj);
			}
		});
	},
	'pushTaskID': function(req, callback) {
		var query = {_id: req.body.proj_id}
		ProjectModel.update(query, {$pushAll: {tasks: ["5655a784dbb681cc10b5f03d"]}}, function (err, proj) {
			if(err) {
				console.log(err);
			}else{
				ProjectModel.findOne(query, function (err, proj) {
					if(err) throw err
					else callback(proj);
				})
			}
		})
	},
	'getProj': function(req, callback) {
		ProjectModel
		.findOne({_id: req.body.proj_id})
		.populate({
			path: 'tasks',
			populate: {
				path: 'todos',
				model: 'TodoModel'
			}
		})
		.exec(function (err, proj) {
			if(err) throw err;
			callback(proj);
		})
	}
}

function Project() {
	// initial ...
};
Project.prototype = ProjectProto;
module.exports = Project;