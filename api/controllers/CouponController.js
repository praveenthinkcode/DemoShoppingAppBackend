/**
 * CouponController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
    getCoupons:function(req,res){
        Coupon.find().exec((err,data)=>{
            if(err){
                console.log(err);
                res.json({status:false,message:'Error getting coupons'})
            }
            else{
                res.json({status:true,coupons:data});
            }
        })
    },
    checkCoupon:async function(req,res){
        Coupon.findOne({couponCode:req.body.couponCode},function(err,data){
            if(err){
                res.json({status:false,message:'Invalid token'})
            }
            else if(data){
                if(data.endDate<=new Date().getTime()){
                    res.json({status:false,message:'Coupon Expired'})
                }
                else{
                res.json({status:true,couponCode:req.body.couponCode});
                }
            }
            else{
                res.json({status:false,message:'Invalid Token'})
            }
        })
    },
    removeCoupon:async function(req,res){
        res.json({status:true,couponCode:''});
    }
    ,
    editCoupon:async function(req,res){
        var endDate=new Date(req.body.endDate);
        endDate=endDate.getTime();
        Coupon.update({id:req.body.id}).set({couponCode:req.body.couponCode,discountPercentage:req.body.discountPercentage,endDate:endDate}).fetch().exec((err,data)=>{
            if(err){
                res.json({status:false})
            }
            else{
                res.json({status:true});
            }
        })
    }, 
    addCoupon:async function(req,res){
        var endDate=new Date(req.body.endDate);
        endDate=endDate.getTime();
        Coupon.create({couponCode:req.body.couponCode,discountPercentage:req.body.discountPercentage,endDate:endDate}).fetch().exec((err,data)=>{
            if(err){
                res.json({status:false});
            }
            else{
                res.json({status:true});
            }
        })
    },
    deleteCoupon:async function(req,res){
        Coupon.destroy({id:req.body.editId}).exec((err,data)=>{
          if(err){
              res.json({status:false,message:err})
          }  
          else{
              res.json({status:true})
          }
        })
    }

};

