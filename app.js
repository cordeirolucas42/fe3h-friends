var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/FE_Friends",{ useNewUrlParser: true });
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// var color = {"Golden Deer":"bg-warning","Blue Lion":"bg-primary","Black Eagles":"bg-dark"};
var leader = {"Golden Deer":"Claude","Blue Lion":"Dimitri","Black Eagles":"Edelgard"};

//DATABASE WITH MONGODB
var userSchema = new mongoose.Schema({
   username: String,
   friends: Array,
   house: String
});
var User = mongoose.model("User", userSchema);


//======================================
var currentUser = "Koba";


//ROUTES *******************************************************************

app.get("/",function(req,res){
	User.find({},function(err,users){
		if(err){
			console.log(err);
		} else {
			res.render("home",{users:users});
		}
	});
});

app.get("/friends", function(req,res){	
	User.find({username:currentUser},function(err,user){
		if(err){
			console.log(err);
		} else {
			console.log(user);
			res.redirect("/"+ user[0].username +"/friends");
		}
	});	
});

app.get("/:user/friends", function(req,res){
	currentUser = req.params.user;
	User.find({username:currentUser},function(err,user){
		if(err){
			console.log(err);
		} else {
			//console.log(user);
			res.render("friends",{user:user[0]});
		}
	});
});

app.get("/:user", function(req,res){
	currentUser = req.params.user;
	User.find({username:currentUser},function(err,user){
		if(err){
			console.log(err);
		} else {
			//console.log(user);
			res.render("userPage",{user:user[0]});
		}
	});
});

app.post("/signUp",function(req,res){
	User.create({
		username: req.body.username,
		friends: [leader[req.body.house]],
		house: req.body.house
	}, function(err,user){
		if(err){
			console.log(err);
		} else {
			//console.log(user);
			currentUser = req.body.username;
			res.redirect("/" + currentUser + "/friends");
		}
	});
});

app.post("/addFriend",function(req,res){
	User.find({username:currentUser},function(err,user){
		if(err){
			console.log(err);
		} else {
			user[0].friends.push(req.body.newFriend);
			user[0].save();
		}
	});
	res.redirect("/friends");
});

app.post("/:user/removeFriend/:friend",function(req,res){
	User.find({username:req.params.user},function(err,user){
		if(err){
			console.log(err);
		} else {
			user[0].friends.forEach(function(friend,i){
				if(friend == req.params.friend){
					user[0].friends.splice(i,1);
				}
			})
			user[0].save();
		}
	});
	res.redirect("/friends");
});	
	

app.listen(3000,function(){
	console.log("listening");
});