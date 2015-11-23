var ProjectModel = require('./model/projectModel.js');

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
	}
}

function Project() {
	// initial ...
};
Project.prototype = ProjectProto;
module.exports = Project;