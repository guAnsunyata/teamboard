// handlebars layout config
var hbs_layout = 'layout';

var UserTest = require('../api/model/testUserModel');
var TaskApi = require('../api/task');
var Task = new TaskApi();
var ProjectApi = require('../api/project');
var Project = new ProjectApi();

module.exports = function (app, passport) {
	// 取得 user session
	app.post('/getUserSession', isLoggedIn, function(req, res){
		res.json(req.user.facebook);
	});

  	// get collabs by task id, post body task_id: "..."
	app.post('/api/getusersbytaskid', function (req, res) {
		Task.findcollabsbyid(req, function (data) {
			res.json(data);
		})
	});

	// app.post('/api/getusersbyprojid', function (req, res) {
	// });

  	app.get('/api/users', function (req, res) {
  		UserTest
		.find()
		.select('facebook.name facebook.photo')
		.exec(function (err, data) {
			res.json(data);
		})
  	});

	app.post('/api/users', function (req, res) {

		// if(typeof(req.body.task_id) != 'undefined' && !req.body.task_id ) {
		// 	var query = {
		// 		_id: req.body.task_id
		// 	}
		// 	TaskModel.find(query, function (err, task) {
		// 		if(err) throw err;
		// 		else res.json();
		// 	})
		// }

		UserTest
		.find()
		.select('facebook.name facebook.link')
		.exec(function (err, data) {
			// res.json(data);
		})
	});


	app.get('/api/delusers', function (req, res) {
		UserTest.remove({}, function (err, data) {
			res.json(data);
		})
	});

	app.get('/project', isLoggedIn, function (req, res) {
		res.render('project', {layout: hbs_layout, user: req.user});
	});

  // passport-facebook login related routing
	app.get('/logintest', function (req, res) {
		res.render('login', {layout: hbs_layout});
	});

	app.get('/profiletest', isLoggedIn, function (req, res) {
		res.render('profile', {layout: hbs_layout, user: req.user});
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/project',
	                                      failureRedirect: '/' }));

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});
}

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if(req.isAuthenticated()){
		return next();
	}
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}