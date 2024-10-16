const express = require('express');
const app = express();
const userModel = require('./models/user')
const postModel = require('./models/post')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const multer = require("multer");
const crypto = require('crypto');
const path = require('path')
const upload = require("./config/multerconfig");

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/images/uploads')
//   },
//   filename: function (req, file, cb) {
//     crypto.randomBytes(12,(err,bytes)=>{
//       const fn = bytes.toString("hex") + path.extname(file.originalname);
//       cb(null,fn)
//     })
//   }
// })

// const upload = multer({ storage: storage })


//middleware for protected route
const isLoggedIn = (req,res,next) =>{
  if(req.cookies.token == ''){
    res.redirect('/login')
  }
  else{
    let data = jwt.verify(req.cookies.token,'secret');
    req.user = data;
  }
  next();
};

// app.get('/test',(req,res)=>{
//   res.render('test');
// })
// app.post('/upload',upload.single("image"),(req,res)=>{
//   console.log(req.body);
//   console.log(req.file);  
  
// })

app.get('/',(req,res)=>{
  res.render('index');
});

app.get('/profile/upload',(req,res)=>{
  res.render('profileupload');
})
app.post('/upload',isLoggedIn,upload.single('image'),async(req,res)=>{
  let user = await userModel.findOne({email : req.user.email})  ;
  user.profilepic = req.file.filename;
  await user.save(); 
  res.redirect('/profile');
})

app.get('/login',(req,res)=>{
  res.render('login');
});

app.get('/like/:id',isLoggedIn,async(req,res)=>{
  let post = await postModel.findOne({_id: req.params.id}).populate('user');
  if(post.likes.indexOf(req.user.userid)=== -1){
  post.likes.push(req.user.userid)
  }
  else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
  }
  await post.save();
  res.redirect('/profile')
})

app.get('/edit/:id',isLoggedIn,async(req,res)=>{
  let post = await postModel.findOne({_id: req.params.id}).populate('user');
 
  res.render('edit',{post});
  
})

app.post('/update/:id',isLoggedIn,async(req,res)=>{
  let post = await postModel.findOneAndUpdate({_id: req.params.id},{content : req.body.content})
 
  res.redirect('/profile');
  
})

app.get('/profile',isLoggedIn,async(req,res)=>{
  let user = await userModel.findOne({email: req.user.email}).populate('posts');
  res.render('profile',{user})
})

app.post('/post',isLoggedIn,async(req,res)=>{
  let user = await userModel.findOne({email: req.user.email})
  let {content} = req.body;
  let post = await postModel.create({
    user : user._id,
    content : content
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')
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
      res.status(200).redirect('/profile');
 
    }
    else res.render('/login');
  })
})

app.get('/logout',(req,res)=>{
  res.cookie('token','');
  res.redirect('/login');
})

app.listen(3000);

//users post likh paynge
//s1 users create krne h
//s2 login and register
//s3 logout
//s4 post creation
//s5 post like
//s6 post delete to owner