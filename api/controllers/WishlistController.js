/**
 * WishlistController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getItems:async function(req,res){
      const wishlistItems=await Wishlist.find({userid:req.body.userid});
      var items=[];
      if(wishlistItems.length!==0){ items=wishlistItems[0]['wishlistItems']}
      else{ items=[]}
      res.json({status:true,items:items});
  },
  add:async function(req,res){
    Wishlist.findOne({userid:req.body.userid},(err,items)=>{
        if(items){
            var wishlistItem=[];
            wishlistItem=items.wishlistItems;
            wishlistItem.push(req.body.productId);
           
        Wishlist.update({userid:req.body.userid}).set({wishlistItems:wishlistItem}).fetch().exec(async(err,data)=>{
            res.json({status:true});
        })}
        else{
            var wishlistItem=[];
            wishlistItem.push(req.body.productId);
            Wishlist.create({userid:req.body.userid,wishlistItems:wishlistItem}).fetch().exec((err,data)=>{
                res.json({status:true});
            })
        }
  })

},
    remove:async function(req,res){
    
        Wishlist.findOne({userid:req.body.userid},(err,items)=>{
            if(items){
                var wishlistItem=[];
                wishlistItem=items.wishlistItems;
                var index=wishlistItem.indexOf(req.body.productId);
                wishlistItem.splice(index,1);
               
            Wishlist.update({userid:req.body.userid}).set({wishlistItems:wishlistItem}).fetch().exec(async(err,data)=>{
                res.json({status:true});
            })}})
    },
    allItems:async function(req,res){
        const wishlistItems=await Wishlist.find({userid:req.body.userid});
        var allItems=[];
        if(wishlistItems.length!==0){
            var c=0;
             wishlistItems[0]['wishlistItems'].map(async(data)=>{
            await Products.findOne({id:data},(err,item)=>{
                    allItems.push(item);
                if(c===wishlistItems[0]['wishlistItems'].length-1){    
                    res.json({status:true,allItems:allItems})
                }
                else{
                    ++c;
                }
            })
         
        })
    }
        else{ res.json({status:true,allItems:[]})}

    }

};

