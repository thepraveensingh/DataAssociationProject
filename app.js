const express = require('express');
const app = express();
const userModel = require('./models/user')
const cookieParser = require('cookie-parser');


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
  res.render('index');
});
app.listen(3000);

//users post likh paynge
//s1 users create krne h
//s2 login and register
//s3 logout
//s4 post creation
//s5 post like
//s6 post delete to owner