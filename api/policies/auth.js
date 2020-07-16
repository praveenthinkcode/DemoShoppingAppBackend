    
var jwt = require('jsonwebtoken');
module.exports=function(req,res,next){
   
    try{
        

        
        jwt.verify(req.body.token,sails.config.secret.key);
        next();
    }
    catch(error){
        return res.json({message:"Auth Failed"})
    }
}   