var hbs_layout = 'layout';
module.exports = function (app, passport) {
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