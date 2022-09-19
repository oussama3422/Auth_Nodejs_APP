
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
var GoogleStrategy=require("passport-google-oauth20").Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy = require('passport-facebook').Strategy;
// const saltRounds = 10;

// const md5 = require("md5");
// const encrypt = require("mongoose-encryption");

const app = express();



app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    }));

    
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useCreateIndex:true},{ useNewUrlParser: true });

mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId:String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFiels:["password"]});

const User = new mongoose.model("User", userSchema,);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


passport.use(
  new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
},
function(accessToken, refreshToken, profile, done) {
  console.log(profile);
  return done(null,profile);

}
));
passport.use(
  new FacebookStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets",
  // userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get("/", function(req, res){
  res.render("home");
  
});


app.get("/auth/google",(req,res)=>{

  passport.authenticate("google",{scope:["profile"]})
});
app.get("/auth/facebook",(req,res)=>{

  passport.authenticate("facebook",{scope:["profile"]})
});


app.get("/article",(req,res)=>{
  User.find({},(error,foundArticles)=>{
    if(error)
    {
     console.log("error>>>>");
    }else{
     res.send(foundArticles);
    //  res.send(foundArticles.password);
    }
   });
})




//::::::::::Secret Route:::::::
app.get("/secrets",(req,res)=>{
  
  if(req.isAuthenticated())
  {
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});
//::::::: Login Route::::::::::
app.route("/login")

.get((req, res)=>{
  res.render("login");
})
.post((req,res)=>{
  
  var username = req.body.username;
  var password=req.body.password;
   
  const user = new User({
    email:username,
    password:password,
  });
  req.login(user,(err)=>{
    if(err)
    {
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,()=>{
        res.render("secrets");
      })  
    }
  })
});
  // res.send(email);  
  // res.send(password);

  
  
// res.render("login");  
app.get("/logout",function(req,res){

  req.logout();
  res.redirect("/");
});



app.route("/submit")
.get((req,res)=>{
  res.render("submit");
})
.post((req,res)=>{
  console.log(req.body.secret);
  res.render("submit");
});


app.route("/register")
.get((req,res)=>{
  res.render("register");
})
.post((req,res)=>{
  let email=req.body.username;
  let password=req.body.password;
  User.register(
    {username:email},password,
    function(err,user){
    if(err)
    {
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
      }
      );
     }
    }
    );

  });

  
  // bcrypt.hash(password,saltRounds,(err,hash)=>{
  //   const user=new User({
  //     email:email,
  //     password:hash,
  //   });
    // res.render("secrets")
  //   user.save((err)=>{
  //     if(err)
  //     {
  //       console.log("Somthing Went Wrong!!");
  //     }else{
  //       res.render("secrets");
  //     }
  //   })
  // })
 









app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
