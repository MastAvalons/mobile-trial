var assert = require('assert'),
		mongoose = require('mongoose');

var config = require('./../config');

var userSv	= require('./../service/user'),
		authenticateSv = require('./../service/authenticate');


describe('authenticate.admin', function(){
	var adminObj = {
			account: "admin@mobiletrial.de",
			password: "topsecret"
		}; 

	var userObj = {
			account: "anyUser@mobiletrial.de",
			password: "anyPassword"
		}; 

	var adminInstance;
	var err = null;
	
	// Connect to Mongo DB
	// Clean user database
	// Create an user and assign him as admin
	// Create another user who is not an admin
	before(function(done){
		console.log("START TEST AUTHENTICATE.ADMIN");
		mongoose.connect(config.mongodb.test); 

		userSv.clean(function(err){
			if(err) throw err;

			userSv.create(adminObj, function(err, user){
				if(err) throw err;

				userSv.assignToAdmin(user, function(err, admin){
					if(err) throw err;
					adminInstance = admin;

					userSv.create(userObj, function(err, otherUser){
						if(err) throw err;
						done();
					});
				});
			});
		})
	});

	// Disconnect
	after(function(){
		console.log("END TEST AUTHENTICATE.ADMIN");
		mongoose.disconnect();
	});

	it('should return an error for undefined account parameter', function(done){
		var undefinedParameter;
		authenticateSv.admin(undefinedParameter, adminObj.password, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for null account parameter', function(done){
		authenticateSv.admin(null, adminObj.password, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});

	it('should return an error for undefined password parameter', function(done){
		var undefinedParameter;
		authenticateSv.admin(adminObj.account, undefinedParameter, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should return an error for null password parameter', function(done){
		authenticateSv.admin(adminObj.account, null, function(err, isAuthorized){
			assert.notEqual(err, null);
			done();
		});
	});	

	it('should disallow access for existing user that is not an admin', function(done){ 
		authenticateSv.admin(userObj.account, userObj.password, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for account that does not exist', function(done){
		authenticateSv.admin("notexist@mobiletrial.de", "anyPassword", function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should disallow access for existing admin but wrong password', function(done){
		authenticateSv.admin(adminObj.account, "wrongPassword", function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, false);
			done();
		});
	});

	it('should allow access for valid combination of account and password', function(done){
		authenticateSv.admin(adminObj.account, adminObj.password, function(err, isAuthorized){
			assert.ifError(err);
			assert.equal(isAuthorized, true);
			done();
		});
	});
});