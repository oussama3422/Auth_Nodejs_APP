//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFiels:["password"]});

const User = new mongoose.model("User", userSchema,);

app.get("/", function(req, res){
  res.render("home");
});

//::::::: Login Route::::::::::
app.route("/login")

.get((req, res)=>{
  res.render("login");
})

.post((req,res)=>{
  
  let username = req.body.username;
  let password=req.body.password;
   
  User.find({email:username},(err,foundUser)=>{
    if(err){
      console.log("Somthing Went Wrong");
    }else{
      if(foundUser){
        if(foundUser.password==password)
        {
          console.log("user Exist");
          res.render("secrets");
        }
      }else{
        console.log("Youre EMail not matche that email in database");
      }
    }
  });
});
  // res.send(email);  
  // res.send(password);

  
  
// res.render("login");  
app.route("/logout")
.get((req,res)=>{
  res.render("login");
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
  // console.log(req.body.username);
  // console.log(req.body.password);
  const user=new User({
    email:req.body.username,
    password:req.body.password,
  });
  // res.render("secrets")
  user.save((err)=>{
    if(err)
    {
      console.log("Somthing Went Wrong!!");
    }else{
      res.render("secrets");
    }
  })
});








app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
