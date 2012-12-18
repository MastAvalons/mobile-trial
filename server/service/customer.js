var crypto = require('crypto');
var db = require('../data/db');

exports.get = function(account, next){
	if(!account){
		next(err);
		return;
	}
	db.Customer.findOne({'account': getHashedAccount(account)}, function(err, customer){
		if(err){
			next(err);
			return;
		}
		next(null, customer);
	});
}

exports.create = function(account, app, versionCode, next){
	var customer = new db.Customer();
	
	//Hash mail with sha1 for privacy reasons
	customer.account = getHashedAccount(account);
	customer.app = app;
	customer.createdAt = new Date();
	customer.modifiedAt = customer.createdAt;
	customer.save(function(err){
		if(err) {
			next(err);
		} else
			next(null, customer);
	});
} 


exports.update = function(customer, versionCode, next){
	customer.versionCode = versionCode;
	customer.modifiedAt = new Date();
	customer.save(function(err){
		if(err) {
			next(err);
		} else 
			next(null, customer);
	});
}


function getHashedAccount(account){
	var shasum = crypto.createHash('sha1');
	shasum.update(account, 'utf8');
	return shasum.digest('hex');
}