
const express=require('express');
const router=express.Router();
const userController=require('../controllers/users');

router.get(["/","/one"],(req,res)=>{
    res.render("one");
});

router.get("/signup",(req,res)=>{

    res.render("signup");
});

router.get("/edit",userController.isLoggedIn,(req,res)=>{

    if(req.user){
        res.render('edit',{user:req.user});

    }else{
        res.redirect('/one');
        
    }
});

router.get("/profile",userController.isLoggedIn,(req,res)=>{

    if(req.user){
        res.render('profile',{user:req.user});

    }else{
        res.redirect('/one');
        
    }
});

router.get("/home",userController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render('home',{user:req.user});

    }else{
        res.redirect('/one');
        
    }

    res.render("home");
});

router.get("/forgot",(req,res)=>{

    res.render("forgot");
});

module.exports= router;