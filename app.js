// APP INITIALIZATION
var express = require("express"); //import NPM express
var passport = require("passport");
var bodyParser = require("body-parser"); //import NPM body-parser
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");

var app = express(); //initialize app with express
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true})); //setting body-parser
app.use(require("express-session")({
    secret: "top top top",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs"); //setting ejs as standard
var theport = process.env.PORT || 5000;

//DATABASE INITIALIZATION
var mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// heroku config:get MONGODB_URI
var uri = 'mongodb://heroku_kwqtcvpl:6vc6v5m55i5v41jb0tj5hejgvl@ds211368.mlab.com:11368/heroku_kwqtcvpl';
mongoose.connect(uri);
User = require("./models/user");
Friend = require("./models/friend");
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// User.create({username:"cord",password:"123456",house:"Golden Deer"},(err,user)=>{
// 	if(!err){
// 		console.log("seed the database");
// 	}
// });

// var friends = [
// 	{name:"Felix",affiliation:"Blue Lions"},
// 	{name:"Dedue",affiliation:"Blue Lions"},
// 	{name:"Ashe",affiliation:"Blue Lions"},
// 	{name:"Sylvain",affiliation:"Blue Lions"},
// 	{name:"Raphael",affiliation:"Golden Deer"},
// 	{name:"Lysithea",affiliation:"Golden Deer"},
// 	{name:"Marianne",affiliation:"Golden Deer"},
// 	{name:"Lorenz",affiliation:"Golden Deer"},
// 	{name:"Hubert",affiliation:"Black Eagles"},
// 	{name:"Bernadetta",affiliation:"Black Eagles"},
// 	{name:"Ferdinand",affiliation:"Black Eagles"},
// ]

// friends.forEach(function(friend){
// 	Friend.create(friend,(err,friend)=>{
// 		if(!err){
// 			console.log("created friend");
// 		}
// 	});
// });

//===================================ROUTES===================================

app.get("/",(req,res)=>{
	User.find({},(err,users)=>{
		if(!err){
			res.render("home",{users:users});
		}		
	});
});

app.post("/signup",(req,res)=>{
	var newUser = req.body.user;
	User.register(new User({username: newUser.username,house:newUser.house}),newUser.password,(err,user)=>{
		if(err){
			console.log(err.message);
			return res.redirect("/");
		} else {			
			switch(user.house){
				case "Golden Deer":
					Friend.findOne({name:"Claude"},(err,friend)=>{
						if(err){
							console.log(err);
						} else{
							user.friends.push(friend);
							user.save();
							console.log("added friend");
						}
					});
					break;
				case "Blue Lions":
					Friend.findOne({name:"Dimitri"},(err,friend)=>{
						if(err){
							console.log(err);
						} else{
							user.friends.push(friend);
							user.save();
							console.log("added friend");
						}
					});
					break;
				case "Black Eagles":
					Friend.findOne({name:"Edelgard"},(err,friend)=>{
						if(err){
							console.log(err);
						} else{
							user.friends.push(friend);
							user.save();
							console.log("added friend");
						}
					});
					break;
			}
			res.redirect("/");
		}
	});
});

app.post("/login",passport.authenticate("local",{
	failureRedirect: "/"
}),(req,res)=>{
	res.redirect("/user");
});

app.get("/user",isLoggedIn,(req,res)=>{
	res.render("userPage",{user:req.user});
});

app.get("/logout",(req,res)=>{
	req.logout();
	res.redirect("/");
});

app.get("/friends",isLoggedIn,(req,res)=>{
	User.findById(req.user._id).populate("friends").exec(function(err,user){
		if(!err){
			res.render("friends",{user:user});
		}
	});	
});

app.get("/:id",isLoggedIn,(req,res)=>{
	if(req.params.id==req.user._id){
		res.redirect("/user");
	} else {
		res.redirect("/");
	}
});

app.delete("/friends/:id",isLoggedIn,(req,res)=>{
	req.user.friends.forEach(function(friend,index){
		console.log("is "+friend+" equal to "+req.params.id+"?");
		if(friend==req.params.id){				
			req.user.friends.splice(index,1);
			req.user.save();
			console.log("removed "+req.params.id+" from "+req.user.username+"'s friend list");
		}
	});
	res.redirect("/friends");
});

app.post("/friends",isLoggedIn,(req,res)=>{
	Friend.findOne({name:req.body.newFriend},(err,friend)=>{
		if(!friend){
			console.log("Character doesn't exist");
			Friend.create({name:req.body.newFriend},(err,friend)=>{
				if(!err){
					console.log("created new character "+friend.name);
				}
			});
		} else {
			req.user.friends.push(friend);
			req.user.save();
			console.log("added "+friend.name+" to "+req.user.username+"'s friend list");
		}
		res.redirect("/friends");
	});
});

//MIDDLEWARE

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}
// START SERVER
app.listen(theport,function(err){
	if (err){
		console.log(err);
	} else {
		console.log("Listening on port "+theport);
	}
});