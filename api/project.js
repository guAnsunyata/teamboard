var ProjectModel = require('./model/projectModel.js');
var TaskModel = require('./model/taskModel.js');
var TodoModel = require('./model/todoModel.js');

var ProjectProto = {
	//最殘的create
	'create': function(req, callback) {
		var new_project = new ProjectModel({
			name: req.body.name,
			desc: req.body.desc
		});
		new_project.save(function (err, project){
			if(err) throw err;
			callback(project);
		})
	},
	'find': function(req, callback) {
		ProjectModel.find({'_id': req.body.id}, function (err, project) {
			if(err) throw err;
			callback(project);
		})
	},
	'updateName': function(req, callback) {
		var query = { '_id': req.body.id }
		ProjectModel.update(query, {
			'name': req.body.name
		}, function (err, proj) {
			callback(proj);
		});
	},
	'updateDesc': function(req, callback) {
		var query = { '_id': req.body.id }
		ProjectModel.update(query, {
			'desc': req.body.desc
		}, function (err, proj) {
			callback(proj);
		});
	}
}

function Project() {
	// initial ...
};
Project.prototype = ProjectProto;
module.exports = Project;