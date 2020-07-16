/**
 * FeedbackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    getDetails:function(req,res){
        Feedback.find({productId:req.body.productId}).exec((err,data)=>{
            res.json({status:true,feedback:data});
        })
    },
    addFeedback:async function(req,res){
        var username='';
        Users.findOne({userid:req.body.userid},async function(err,data){
            username=data.name;
            Feedback.create({username:username,productId:req.body.productId,userid:req.body.userid,rating:req.body.rating,feedbackText:req.body.feedbackText}).fetch().exec(async(err,data)=>{
                if(err){
                    res.json({status:false})
                }
                else{
                    
                    let allFeedback=await Feedback.find();
                    res.json({status:true,data:allFeedback});
                }
        })
        });
    },
    addOrderFeedback:async function(req,res){
        Feedback.create({orderId:req.body.orderId,userid:req.body.userid,rating:req.body.rating,feedbackText:req.body.feedbackText}).fetch().exec(async(err,data)=>{
            if(err){
                res.json({status:false})
            }
            else{
                res.json({status:true})
            }
    })
    }
};

