const mysql=require('mysql');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {promisify}=require('util');
const { type } = require('os');

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
exports.one=async(req,res)=>{
    try{
        const{emailid,password}=req.body;
        if(!emailid||!password){
            return res.status(400).render('one',{msg:"Please enter email and password",msg_type:'error'});
        }
        db.query('select * from amsnew where email=?',[emailid],async(error,result)=>{
            if(result.length<=0){
                return res.status(401).render('one',{msg:"Emailid incorrect",msg_type:'error'});
            }
            else{
                if(!(await bcrypt.compare(password,result[0].PASS))){
                    return res.status(401).render('one',{msg:"Password incorrect",msg_type:'error'});
                }
                else{
                    const id=result[0].ID;
                    
                    const token=jwt.sign({id:id},process.env.JWT_SECRET,{
                        expiresIn:process.env.JWT_EXPIRES_IN
                    });
                    const cookieOptions={
                        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*60*60*1000),httpOnly: true
                    };
                    res.cookie('rajesh',token,cookieOptions);
                    res.status(200).redirect('/home');
                }
            }
        });
    }
    catch(error){
        console.log(error);
    }
};

exports.edit=async(req,res,next)=>{
    console.log('edit');
    const uname=req.body.username;
    if(req.cookies.rajesh){
        console.log("cookie");
        try{
        const decode=await promisify(jwt.verify)(
            req.cookies.rajesh,process.env.JWT_SECRET
        );
        console.log(decode.id);
        if(uname && !req.file){
            db.query('UPDATE amsnew SET name=? WHERE id=?',[uname,decode.id],(err,results)=>{
                if(err){
                    console.log('error');
                }
                else{
                    return res.render('edit',{msg:"Updated success",msg_type:'good'});
                }
            })
        }else if(!uname && req.file){
            const image = req.file.filename;
            db.query('UPDATE amsnew SET profileimg=? WHERE id=?',[image,decode.id],(err,results)=>{
                if(err){
                    console.log('error');
                }
                else{
                    return res.render('edit',{msg:"Updated success",msg_type:'good'});
                }
            })
        }else if(!uname||!req.file){
            return res.status(400).render('edit',{msg:"Please enter input",msg_type:'error'});
            
        }
        else{
            if(uname&&req.file){
                const image = req.file.filename;
                const uname=req.body.username;

                db.query('UPDATE amsnew SET name=?, profileimg=? WHERE id=?',[uname,image,decode.id],(err,results)=>{
                    if(err){
                        console.log('error');
                    }
                    else{
                        return res.render('edit',{msg:"Updated success",msg_type:'good'});
                    }
                })
            }
        }
        }catch(err){
            console.log(err);
        }   
}
}



exports.signup=(req,res)=>{
    
    const{username,emailid,password,confirmpassword}=req.body;
    db.query('select email from amsnew where email=?',[emailid],async (error,result)=>{
        if(error){
            console.log(error);
        }
        if(!username || !emailid || !password || !confirmpassword){
            return res.render('signup',{msg:"All details are required",msg_type:'error'});
        }
        if(result.length>0){
            return res.render('signup',{msg:"Email already exist",msg_type:'error'});
        }
        if(password!==confirmpassword){
            return res.render('signup',{msg:"Password doesn't match",msg_type:'error'});
        }else {
            let hashedPassword =await bcrypt.hash(password,8);

        db.query("insert into amsnew set ?",{name:username,email:emailid,pass:hashedPassword},(error,result)=>{
            if(error){
                console.log(error);
            }
            else{
                return res.render('signup',{msg:"User signup success",msg_type:'good'});
            }
            });
        }
    }
    );
};

exports.isLoggedIn=async(req,res,next)=>{
    if(req.cookies.rajesh){
        try{
        const decode=await promisify(jwt.verify)(
            req.cookies.rajesh,process.env.JWT_SECRET
        );
        console.log(decode);
        db.query('select * from amsnew where id=?',[decode.id],(err,results)=>{
            if(!results){
                return next();
            }
            req.user=results[0];
            return next();
        });
        }
        catch (error){
            console.log(error);
            return next();
        }
    }else{
        next();
    }
    };

exports.logout=async(req,res)=>{
        res.cookie('rajesh','logout',{
            expires:new Date(Date.now()+2*1000),
            httpOnly: true,
        });
        res.status(200).redirect('/');
    };

exports.forgot=async(req,res)=>{
        try{
            const{email,newpass,confirmpass}=req.body;
        if(!email||!newpass || !confirmpass){
            return res.status(400).render('forgot',{msg:"Please enter email and password",msg_type:'error'});
        }
        db.query('select * from amsnew where email=?',[email],async(error,result)=>{
            if(result.length<=0){
                return res.status(401).render('forgot',{msg:"Emailid or Password incorrect",msg_type:'error'});
            }
            if(newpass!==confirmpass){
                return res.render('forgot',{msg:"Password doesn't match",msg_type:'error'});
            }else{
                let hashedPassword =await bcrypt.hash(newpass,8);

                        db.query('UPDATE amsnew SET pass=? WHERE email=?',[hashedPassword,email],
                        (error,result)=>{
                            if(error){
                                console.log(error);
                            }
                            else{
                                console.log(result);
                                return res.render('forgot',{msg:"Password changed",msg_type:'good'});
                            }
                            });

            }
        })
        }catch(error){
            console.log(error);
        }
    }

    exports.profile=async(req,res)=>{
        console.log('del');
        if(req.cookies.rajesh){
            console.log("cookie");
            try{
            const decode=await promisify(jwt.verify)(
                req.cookies.rajesh,process.env.JWT_SECRET
            );
            console.log(decode.id);
                db.query('UPDATE amsnew SET name=NULL , profileimg=NULL WHERE id=?',[decode.id],(err,results)=>{
                    if(err){
                        console.log('error');
                        return res.render('profile', { msg: "Error deleting profile", msg_type: 'good' });
                    }
                    else{
                        return res.render('profile',{msg:"Deleted",msg_type:'good'});
                    }





                    
                })
            }catch(err){
                console.log(err);
            }   
        }
    }