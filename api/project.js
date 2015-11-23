var ProjectModel = require('./model/projectModel.js');
var TaskModel = require('./model/taskModel.js');
var TodoModel = require('./model/todoModel.js');

var ProjectProto = {
	//最殘的create
	'unformalCreate': function(req, callback) {
		var new_project = new ProjectModel({
			name: 'PatchWork test proj',
			desc: 'no description needed'
		});
		new_project.save(function (err, project){
			if(err) throw err;
			callback(project);
		})
	},
	'unformalFind': function(req, callback) {
		ProjectModel.find({'_id':'5653015b58fe43dc186ec0a0'}, function (err, project) {
			if(err) throw err;
			callback(project);
		})
	},
	'updateName': function(req, callback) {
		var query = { '_id':'5653015b58fe43dc186ec0a0' }
		ProjectModel.update(query, {
			'name': 'change proj name again'
		}, function (err, proj) {
			if(err) throw err;
			callback(proj);
		});
	}
}

function Project() {
	// initial ...
};
Project.prototype = ProjectProto;
module.exports = Project;