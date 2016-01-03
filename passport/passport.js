var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var UserTest = require('../api/model/testUserModel');
var auth = require('./auth');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        // console.log('serializing user: ' + user);
        done(null, user);
    });

    passport.deserializeUser(function(id, done) {
        UserTest.findById(id, function(err, user) {
            // console.log('deserializing user: ' + user);
            if(!err) done(null, user);
            else done(err, null);
        });
    });

    passport.use(new FacebookStrategy({
        clientID:       auth.facebookAuth.clientID,
        clientSecret:   auth.facebookAuth.clientSecret,
        callbackURL:    auth.facebookAuth.callbackURL,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified'],
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
            console.log("link: "+profile.profileUrl);
            UserTest.findOne({'facebook.id': profile.id}, function(err, user){
                if(err)
                    return done(err);
                if(user)
                    return done(null, user);
                else {
                    var newUser = new UserTest();
                    // console.log(profile);
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.fname = profile.name.familyName;
                    newUser.facebook.lname = profile.name.givenName;
                    newUser.facebook.email = profile.emails[0].value;
                    newUser.facebook.link = profile.profileUrl;

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
}