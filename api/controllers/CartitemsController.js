/**
 * CartitemsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
module.exports = {
  
    add:async function(req,res){
        var cartItems = req.body || [];
        var price=0;
        var DiscountedPrice=0;
        if (cartItems.length == 0) {
          return res.badRequest();
         }
        price=req.body.price;
        if(req.body.discountPercentage){
            price=price-(req.body.price*req.body.discountPercentage)/100; 
            DiscountedPrice=req.body.price-price;
        }
        Cartitems.findOrCreate({userid:req.body.userid,productId:req.body.productId},{Name:req.body.Name,Price:price,Link:req.body.link,Quantity:req.body.Quantity,productId:req.body.productId,weight:req.body.weight,width:req.body.width,height:req.body.height,depth:req.body.depth,userid:req.body.userid,DiscountedPrice:DiscountedPrice.toFixed(2)}).exec((err,user,wasCreated)=>{
          if (err) { return res.serverError(err); }
            if(wasCreated) {
            res.json({status:true})
            }
            else {
                Cartitems.update({Name:user.Name}).set({Name:user.Name,Quantity:user.Quantity+1}).fetch().exec((err,data)=>{
                    res.json({status:true})
                })
            }
        }) 
         
    },
    
    increment: async function(req,res){
        var toincrementItem = req.body || [];
        if (toincrementItem.length == 0) {
          return res.badRequest();
         }
         Cartitems.findOne({userid:req.body.userid,productId:req.body.productId},(err,items)=>{
             Cartitems.update({userid:req.body.userid,productId:req.body.productId}).set({Name:req.body.Name,Quantity:items.Quantity+1}).fetch().exec(async(err,data)=>{
                var uniqueUserData=await Cartitems.find({userid:req.body.userid});  
                res.json(uniqueUserData)
            })
        })
    },

    decrement: function(req,res){
        var toincrementItem = req.body || [];
        if (toincrementItem.length == 0) {
          return res.badRequest();
         }
         Cartitems.findOne({userid:req.body.userid,productId:req.body.productId},(err,items)=>{
            Cartitems.update({userid:req.body.userid,productId:req.body.productId}).set({Name:req.body.Name,Quantity:items.Quantity-1}).fetch().exec(async(err,data)=>{
                var uniqueUserData=await Cartitems.find({userid:req.body.userid});
                res.json(uniqueUserData)
            })
        })
    },

    remove: function(req,res){
        var toremove = req.body || [];
        if (toremove.length == 0) {
          return res.badRequest();
         }
         Cartitems.destroy({userid:req.body.userid,productId:req.body.productId}).exec(async(err,data)=>{
            var cartItems=await Cartitems.find({userid:req.body.userid});
                res.json({status:true,cartItems:cartItems});
        })
    },

    totalAmount: async function(req,res){
      var cartData=await Cartitems.find({userid:req.body.userid});
      var sum=0;    
      if(cartData){
        cartData.map((data)=>{
        sum=sum+(data.Price*data.Quantity);
     })
      }
      Coupon.findOne({couponCode:req.body.couponCode},function(err,data){
        if(err){
            res.json({message:'Invalid token'})
        }
        else if(data){
            var discountedAmount=sum-((data.discountPercentage*sum)/100);
            res.json(discountedAmount.toFixed(2));
        }
    else{
        res.json(sum.toFixed(2));
    }})
    },

    itemsremoval: async function(req,res){ 
        await Cartitems.destroy({userid:req.body.userid});
        res.json({status:true})
    },
    getCartitems:function(req,res){
        Cartitems.find().where({userid:req.body.userid}).exec((err,data)=>{
           res.json({status:true,data:data})
        })
    }
};
