/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var jwt = require('jsonwebtoken');
var bcrypt=require('bcrypt')
var id;
var token;
var XLSX = require('xlsx');
var accountSid = 'ACaf7acf3278a5cc699eefc2fe938b0eb3';
var authToken = '3dd5223e6ab222c7ef2c866b61f43e2d';
var twilio = require('twilio')
var client=new twilio(accountSid, authToken);
var nodemailer = require('nodemailer');
const Speakeasy = require   ("speakeasy");
module.exports = {
  
    signup:async function(req,res){   
        var nodemailer = require('nodemailer');
        Users.findOne({email:req.body.email,number:req.body.number},(err,dataa)=>{
            if(dataa){
                if(dataa.status==='unverified'){
                    var secret=Speakeasy.generateSecret({ length: 20 });
                    const otptoken= Speakeasy.totp({
                        secret: secret.base32,
                        encoding: "base32",
                    });
                       
                        client.messages.create({
                        body: 'OTP for verification is '+otptoken,
                         from: '+18329246041',
                          to: '+91'+req.body.number
                        }).then(message => console.log(message));
                         res.json({message:"Success",secret:secret.base32,email:req.body.email})    
                }
                else{
                res.json({message:"Exists"})}}
            else{
                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    if (err) return res.send('An error occured', 500);
                    id=""+Math.floor(Date.now() / 1000)+Math.floor(Math.random() * 101);
                    Users.create({role:"customer",status:"unverified",userid:id,name:req.body.name,number:req.body.number,email:req.body.email,password:hash,profilePictureURI:'https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg'}).fetch().exec((err,data)=>{      
                   
                        var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                        user: 'praveenpr1998@gmail.com',
                        pass: '30061999pra'
                        }
                        }); 
                        var secret=Speakeasy.generateSecret({ length: 20 });
                        const otptoken= Speakeasy.totp({
                            secret: secret.base32,
                            encoding: "base32",
                        });
                        client.messages
                        .create({
                        body: 'OTP for verification is '+otptoken,
                         from: '+18329246041',
                          to: '+919626796998'
                        })
                    .then(message => console.log(message.sid));

                         transporter.sendMail({
                                to:req.body.email,
                                subject:'confirm',
                                html:`OTP verfictaion: <p>${otptoken}</p>`,
                         });
                         res.json({message:"Success",secret:secret.base32,email:req.body.email})  
                })
            })
            }
        }) 
    },

    confirmation:async function(req,res){
        const isValid = Speakeasy.totp.verify({
            secret: req.body.secret,
            encoding: "base32",
            token: req.body.code,
            window: 10
        });
     if(isValid){
        Users.update({email:req.body.email}).set({status:"verified"}).fetch().exec(async(err,valid)=>{
            var user=await Users.findOne({email:req.body.email}); 
            token = jwt.sign({user: user.userid}, sails.config.secret.key); 
            res.json({status:true,userid:user.userid,token:token,username:user.name})
    })
    }
  else{
      res.json({message:"Inavlid OTP"})
  }
    },
    login:async function(req,res){   
      
        Users.findOne({email:req.body.email},function (err,user){
        if(user){ 
            bcrypt.compare(req.body.password, user.password, function(err, valid) {
                if(err || !valid){
                    return res.json('Invalid username and password combination!', 500)}
            token = jwt.sign({user: user.userid}, sails.config.secret.key); 
            res.json({message:"Success",userid:user.userid,token:token,username:user.name});})
        }
        else{
            res.json({message:"Username Invalid"})
        }
    })
    },
    
    fbLogin:async function(req,res){
     
        Users.findOne({email:req.body.email},function(err,user){
           
            if(user){
                if(user.password!==''){
                token = jwt.sign({user: req.body.id}, sails.config.secret.key);
                res.json({message:"PasswordSet",userid:user.userid,token:token,username:user.name});
                }else{
                    res.json({message:"PasswordNotSet",userid:user.userid})
                }
            }
            else{
                Users.create({role:"customer",status:"verified",name:req.body.name,userid:req.body.id,email:req.body.email,password:'',profilePictureURI:'https://i.ytimg.com/vi/MPV2METPeJU/maxresdefault.jpg'}).fetch().exec((err,user)=>{ 
                 
                    res.json({message:"PasswordNotSet",userid:user.userid});
                })
            }
        })
    },

    setPassword:async function(req,res){
    
        Users.findOne({userid:req.body.userid},function(err,user){
            bcrypt.hash(req.body.password, 10, function(err, hash) {
             Users.update({userid:req.body.userid}).set({password:hash}).fetch().exec(function(err,data){
            if(err){
                res.json({message:'Error Creating Password'})
            }
            else{
                token = jwt.sign({user: req.body.userid}, sails.config.secret.key);
                res.json({status:true,name:user.name,token:token,userid:user.userid});
            }   
        })
    })
    })
    },

    getProfileDetails:function(req,res){
        Users.findOne({userid:req.body.userid},function(err,data){
            if(err){
                res.json({status:false,message:'Error retrieveing user profile'})
            }    
            else{
                res.json({status:true,data:data});
            }
        }) 
    },

    editProfile:function (req,res) {

        if(req.body.newUserName){
            Users.update({userid:req.body.userid}).set({name:req.body.newUserName}).fetch().exec((err,data)=>{
                if(err){
                    res.json({message:'Error changing UserName'})
                }
                else{
                    res.json({message:'Success',userDetails:data})
                }
            })
        }
        else if(req.body.oldPassword){

            Users.findOne({userid:req.body.userid},function (err,user){
                    if(err){
                        res.json({message:'Error retriveing user Data'})
                    }
                    else{
                        bcrypt.compare(req.body.oldPassword, user.password, function(err, valid) {
                            if(valid){
                                bcrypt.hash(req.body.oldPassword, 10, function(err, hash) {
                                Users.update({userid:req.body.userid}).set({password:hash}).fetch().exec((err,data)=>{
                                    if(err){
                                        res.json({message:'Error changing UserName'})
                                    }
                                    else{
                                        res.json({message:'Success',userDetails:data})
                                    }
                                })})
                            }
                            else{
                                res.json({message:'Invalid Password'});
                            }
                        })
                    }
            })
           
        }
        
    },
    resetPassword:function (req,res) {
      
        Users.findOne({email:req.body.email},function (err,user){
           
                        if(err){
                        res.json({status:'error',message:'Invalid email id'})
                         }
                        else if(user){
                            var token= '';
                            var characters= 'ABCDEFGHIJ';
                            var charactersLength = characters.length;
                            for ( var i = 0; i < charactersLength; i++ ) {
                                token += characters.charAt(Math.floor(Math.random() * charactersLength));
                            }
                         var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                        user: 'praveenpr1998@gmail.com',
                        pass: '30061999pra'
                        }
                        }); 
                           transporter.sendMail({
                                to:req.body.email,
                                subject:'Password Reset',
                                html:`Your temporary password is: <p>${token}</p><p> You can change this password once you login.`,
                         }, (err, info) => {
                             if(err){
                                 res.json({status:true,message:'Error sending email try again later'})
                             }
                             else{
                            bcrypt.hash(token, 10, function(err, hash) {
                                Users.update({email:req.body.email}).set({password:hash}).fetch().exec((data)=>{
                                   res.json({status:true,message:'Success'});
                               })
                            })
                            }
                        });
                      
                }
                else{
                    res.json({status:false,message:'invalid Email'});
                }
        })   
    },
    check:function(res,req){
        res.json({message:"valid"})
    },
    addProfilePicture:function(req,res){
        Users.update({userid:req.body.userid}).set({profilePictureURI:req.body.profilePictureURI}).fetch().exec((err,data)=>{
            res.json({status:true,data:data});
        })
    },
    editUser:async function(req,res){
        Users.update({userid:req.body.userid}).set({name:req.body.username,email:req.body.email,mobile:req.body.mobile}).fetch().exec((err,data)=>{
            if(err){
                res.json({status:false});
            }
            else{
                res.json({status:true})
            }
        })
    },
    deleteUser:async function(req,res){
        Users.destroy({userid:req.body.userid},function(err,data){
            if(err){
                res.json({status:false})
            }
            else{
                res.json({status:true})
            }
        })
    },
    mailToUser:async function(req,res){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'praveenpr1998@gmail.com',
            pass: '30061999pra'
            }
            }); 
            transporter.sendMail({
                to:req.body.email,
                subject:'From SHopping App Admin',
                html:`<p>${req.body.mailDescription}</p>`,
         });
         res.json({status:true});
    }

};
