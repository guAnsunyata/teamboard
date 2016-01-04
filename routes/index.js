// handlebars layout config
var hbs_layout = 'layout';

var UserTest = require('../api/model/testUserModel');
var TaskModel = require('../api/model/taskModel.js');
var ProjectModel = require('../api/model/projectModel.js');

module.exports = function (app, passport) {
	app.post('/getUserSession', isLoggedIn, function(req, res){
		res.json(req.user.facebook);
	});

  // user api
	app.post('/api/users', function (req, res) {

		if(typeof(req.body.task_id) != 'undefined' && !req.body.task_id ) {
			
		}


		UserTest
		.find()
		.select('facebook.name facebook.link')
		.exec(function (err, data) {
			// res.json(data);
		})
	});


	// app.get('/api/delusers', function (req, res) {
	// 	UserTest.remove(function (err, data) {
	// 		res.json(data);
	// 	})
	// });

  // passport-facebook login related routing
	app.get('/logintest', function (req, res) {
		res.render('login', {layout: hbs_layout});
	});

	app.get('/profiletest', isLoggedIn, function (req, res) {
		res.render('profile', {layout: hbs_layout, user: req.user});
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

	app.get('/auth/facebook/callback', 
	  passport.authenticate('facebook', { successRedirect: '/profiletest',
	                                      failureRedirect: '/logintest' }));

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/logintest');
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
	res.redirect('/logintest');
}