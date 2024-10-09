const express = require('express');
const app = express();
const userModel = require('./models/user')
const postModel = require('./models/post')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//middleware for protected route
const isLoggedIn = (req,res,next) =>{
  if(req.cookies.token == ''){
    res.send('you must be logged in')
  }
  else{
    let data = jwt.verify(req.cookies.token,'secret');
    req.user = data;
  }
  next();
};

app.get('/',(req,res)=>{
  res.render('index');
});
app.get('/login',(req,res)=>{
  res.render('login');
});
app.get('/profile',isLoggedIn,(req,res)=>{
  console.log(req.user);
  res.render('login')
})
app.post('/register',async(req,res)=>{
  let {email,password,username,name,age}= req.body;
  let user = await userModel.findOne({email});
  if(user) return res.status(500).send("User already registered");
  bcrypt.genSalt(10,(err,salt) =>{
    bcrypt.hash(password,salt,async(err,hash)=>{
      let user = await userModel.create({
        username,
        email,
        age,
        name,
        password: hash
      })
      let token = jwt.sign({email:email , userid:user._id},"secret");
      res.cookie("token",token);
      res.send("registered")
    })
  })


})

app.post('/login',async(req,res)=>{
  let {email,password}= req.body;
  let user = await userModel.findOne({email});
  if(!user) return res.status(500).send("something went wrong");
  bcrypt.compare(password,user.password,(err,result)=>{
    if(result){
      let token = jwt.sign({email:email , userid : user._id},'secret')
      res.cookie('token',token);
      res.status(200).send("u can login");
 
    }
    else res.redirect('/login');
  })
})

app.get('/logout',(req,res)=>{
  res.cookie('token','');
  res.redirect('/');
})

app.listen(3000);

//users post likh paynge
//s1 users create krne h
//s2 login and register
//s3 logout
//s4 post creation
//s5 post like
//s6 post delete to owner