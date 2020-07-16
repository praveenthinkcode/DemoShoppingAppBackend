/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var jwt = require('jsonwebtoken');
var token;

module.exports = {
    adminLogin:async function(req,res){
       
        Admin.findOne({email:req.body.email,password:req.body.password},function (err,user){
            if(user&&user.role==="admin"){ 
                token = jwt.sign({user: user.userid}, sails.config.secret.key);
                res.json({status:true,userid:user.userid,token:token});
            }
            else{
                res.json({status:false})
            }
        })
    }

};

