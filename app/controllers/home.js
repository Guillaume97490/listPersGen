var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
const mongoose=require('mongoose');

var ObjectId=mongoose.Types.ObjectId;

var User            = require('../../app/models/home');


exports.loggedIn = function(req, res, next)
{
	if (req.session.user) { // req.session.passport._id

		next();

	} else {

		res.redirect('/login');

	}

}

exports.home = function(req, res) {
	
	
	res.render('home.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
	
	 });
	 
}


exports.signup = function(req, res) {

	if (req.session.user) {

		res.redirect('/home');

	} else {

		res.render('signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}

}


exports.login = function(req, res) {


	
	if (req.session.user) {

		res.redirect('/home');

	} else {

		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});

	}
	
}

exports.pagePublic = function(req, res) {
	res.render('public');
}

exports.pageInscrits = function(req, res) {

	console.log(req.session);

	if (req.session.user) {
		console.log(req.session.user);

		res.render('inscrit');

	} else {

		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});

	}
	
}
exports.pageAdmin = function(req, res) {

	console.log(req.session);

	if (req.session.user) {
		console.log(req.session.user);

		if (req.session.user.role_id == 1){
			res.render('admin');
		}else{
			res.render('login', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session
			});
		}

	} else {

		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});

	}
	
}

exports.seedUsers = function(req,res){

	var day = dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
	var active_code = bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
	
	for (let index = 0; index < 1000; index++) {

		var newUser = new User();

		newUser._id=new ObjectId();
		newUser.mail    = 'user.'+[index]+'@gmail.com';
		newUser.password = newUser.generateHash('pass');
		newUser.name = 'user'+[index];
		newUser.created_date = day;
		newUser.updated_date = day;
		newUser.status = 'active';
		newUser.active_hash = active_code;

		newUser.save(function(err) {
			if (err)
				throw err;
		});

		console.log([index]);
	}

}



    
