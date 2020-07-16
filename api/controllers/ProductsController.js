/**
 * ProductsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var jwt = require('jsonwebtoken');
var token;

module.exports = {
    data:function(req,res){
        Products.find().sort('name').exec(function(err,data){
            res.json({status:true,data:data})
        })
    },

    list:function(req,res){
    
        Products.find().exec((err,products)=>{
            res.view({products:products}); 
        })
    },

    add:function(req,res){
        Products.create({category:req.body.category,name:req.body.name,price:req.body.price}).fetch().exec((err,data)=>{
            res.json({status:true});
          
        })
    },
    delete:function(req,res){
        
        Products.destroy(req.body.id).exec((err,data)=>{
            Products.find().exec((err,data)=>{
            res.json({status:true,data:data})
            })
        })
    },

    edit:function(req,res){
        Products.findOne(req.param('id'),(err,product)=>{
        res.view({product:product});
        })
    },
    
    update: function(req, res){
        Products.update({id:req.param('id')}).set({category:req.body.category,name:req.body.name,price:req.body.price}).fetch().exec((err,data)=>{
        res.redirect("/products/list")
        })
    },

    searchFilter:async function(req,res){
        var products=await Products.find().where({'name':{startsWith:req.body.searchValue}});
        res.json({status:true,products:products});
    },

    categoryFilter:async function(req,res){
        var products=await Products.find().where({'category':req.body.filteredCategory});
        res.json({status:true,products:products,filteredCategory:req.body.filteredCategory});
    },
    getAllProducts: async (req, res) => {
        var verified=jwt.verify(req.body.token,sails.config.secret.key);
        if(verified){
                try {
                    let allProducts = await Products.find();
                    return res.ok({
                        status: true,
                        allProducts: allProducts});
                } catch (error) {
                    return res.serverError({
                        status: false,
                        msg: error
                    });
                }
            }
            else{
                return res.json({
                    status:false
                });
            }
    },
    editProduct: async(req, res) => {
        try {
            let patch = {
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                discountPercentage: req.body.discountPercentage,
                image: req.body.image,
                category:req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1),
                availability: req.body.availability,
            };
            await Products.update({id: req.body.id}, patch);
            return res.ok({
                status: 200,
                msg: 'PRODUCT EDITED',
            });
        } catch(error) {
            res.serverError({
                status: 500,
                msg: error
            });
        }
     },
      createProduct: async (req, res) => {
        
         try {
             await Products.create({
                 name: req.body.name,
                 category: req.body.category.charAt(0).toUpperCase() + req.body.category.slice(1),
                 description: req.body.description,
                 price: req.body.price,
                 link: req.body.image,
                 discountPercentage: req.body.discountPercentage,
                 availability: req.body.availability,
             });
             res.json({
                 status: true,
                 msg: 'PRODUCT ADDED'
             });
         } catch(error) {
            res.serverError({
                status: false,
                msg: error
            });
         }
      },
      deleteProduct: async (req, res) => {
        try {
            await Products.destroy({id: req.body.id});
            res.ok({
                status: true,
                msg: 'PRODUCT DELETED'
            });
        } catch (error) {
            res.serverError(error);
        }
    },
};

