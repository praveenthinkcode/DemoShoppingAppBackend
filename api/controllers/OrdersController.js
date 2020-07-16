/**
 * OrdersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var Razorpay=require('razorpay');
var nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
const { data } = require('jquery');
var token;
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'praveenpr1998@gmail.com',
    pass: '30061999pra'
    }
    }); 

module.exports = {
        orderid:function(req,res){
           var instance =new Razorpay({
               key_id:'rzp_test_wwfPnacJ10szIa',
               key_secret:'nyvxZTgoCDnn41SpsEJpKew6'
           })
           
           var options = {  
            amount: (req.body.totalamount)*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
            // discount:"1",
            // offers:[
            //   "offer_EbsVrqT2gaFrSY",
            // ],
            payment_capture: '1'
          };
          instance.orders.create(options, function(err, order) {
            res.json({status:true,id:order.id})
          });
        },

        add:async function(req,res){
          var today=new Date();
          var dd=String(today.getDate()).padStart(2,'0');
          var mm=String(today.getMonth()+1).padStart(2,'0');
          var yyyy=today.getFullYear();
          today=mm + '/' + dd +'/' +yyyy;
          var todayy=new Date();
          var time = todayy.getHours() + ":" + todayy.getMinutes() + ":" + todayy.getSeconds();
            if (req.body.length == 0) {
                return res.badRequest();
               } 
               var request = require('request');
               request('https://rzp_test_wwfPnacJ10szIa:nyvxZTgoCDnn41SpsEJpKew6@api.razorpay.com/v1/payments/'+req.body.orderid, async function (error, response, body) {
                const values=JSON.parse(body)
                var discountedAmount=0;
                if(req.body.couponCode){
                Coupon.findOne({couponCode:req.body.couponCode},function(err,data){
                  if(err){
                      res.json({message:'Invalid token'})
                  }
                  else if(data){
                      discountedAmount=req.body.totalamount-((data.discountPercentage*req.body.totalamount)/100);
                  }
                })}
                var user=await Users.findOne().where({userid:req.body.userid});
                var totalWeight=0;
                var totalHeight=0;
                var totalWidth=0;
                var totalDepth=0;
                req.body.items.map((data)=>{
                    totalWeight=data.weight+totalWeight;
                    totalHeight=data.height+totalHeight;
                    totalWidth=data.width+totalWidth;
                    totalDepth=data.depth+totalDepth;
                })
                Orders.create({userid:req.body.userid,userName:user.name,orderid:req.body.orderid,date:todayy,time:time,paymentid:req.body.paymentid,orderStatus:'OrderPlaced',method:values.method,bank:values.bank,wallet:values.wallet,email:values.email,phone:values.contact,signature:req.body.signature,totalamount:values.amount,items:req.body.items,discountedAmount:discountedAmount.toFixed(2),couponCode:req.body.couponCode,Address:req.body.addressLine1,Pincode:req.body.pincode,state:req.body.state,city:req.body.city,mobile:req.body.mobile,totalWeight:totalWeight,totalWidth:totalWidth,totalHeight:totalHeight,totalDepth:totalDepth}).fetch().exec((err,data)=>{
                  if(err){
                          res.json("Error Retry")
                      }
                      else{
                           transporter.sendMail({
                                to:values.email,
                                subject:'Order Confirmation',
                                html:`Order Id: <p>${data.orderid}</p> Order Date:<p>${data.date}</p>`,
                         });
                          res.json({message:"Success",data:data})
                      }
                  })
               });         
        },
        cashOrder:async function(req,res){
          var today=new Date();
          var dd=String(today.getDate()).padStart(2,'0');
          var mm=String(today.getMonth()+1).padStart(2,'0');
          var yyyy=today.getFullYear();
          today=mm + '/' + dd +'/' +yyyy;
          var todayy=new Date();
          var time = todayy.getHours() + ":" + todayy.getMinutes() + ":" + todayy.getSeconds();
            if (req.body.length == 0) {
                return res.badRequest(); 
              } 
              var user=await Users.findOne().where({userid:req.body.userid});
              var discountedAmount=0;
              if(req.body.couponCode){
              Coupon.findOne({couponCode:req.body.couponCode},function(err,data){
                if(err){
                    res.json({message:'Invalid token'})
                }
                else if(data){
                    discountedAmount=sum-((data.discountPercentage*sum)/100);
                }
              })}
              var totalWeight=0;
              var totalHeight=0;
              var totalWidth=0;
              var totalDepth=0;
              req.body.items.map((data)=>{
                  totalWeight=data.weight+totalWeight;
                  totalHeight=data.height+totalHeight;
                  totalWidth=data.width+totalWidth;
                  totalDepth=data.depth+totalDepth;
              })
              Orders.create({userid:req.body.userid,userName:user.name,date:today,time:time,orderStatus:'OrderPlaced',method:"Cash On Delivery",email:user.email,phone:user.mobile,orderid:Math.floor(new Date()/1000),totalamount:req.body.totalamount,items:req.body.items,discountedAmount:discountedAmount.toFixed(2),couponCode:req.body.couponCode,Address:req.body.addressLine1,Pincode:parseInt(req.body.pincode),state:req.body.state,city:req.body.city,mobile:req.body.mobile,totalWeight:totalWeight,totalWidth:totalWidth,totalHeight:totalHeight,totalDepth:totalDepth}).fetch().exec((err,data)=>{
                if(err){
                        res.json({status:false})
                    }
                    else{  
                         transporter.sendMail({
                              to:user.email,
                              subject:'Order Confirmation',
                              html:`Order Id: <p>${data.orderid}</p> Order Date:<p>${data.date}</p>`,
                       });
                      res.json({status:true,orderId:data.orderid});
                    }
                  })
        },
        getAllOrders: async (req, res) => {
              var verified=jwt.verify(req.body.token,sails.config.secret.key);
              if(verified){
                  try {
                      var allOrders = await Orders.find();
                      var startDat=new Date(req.body.startDate);
                      startDat=startDat.getTime();
                      var endDat=new Date(req.body.endDate);
                      endDat.setDate(endDat.getDate());
                      endDat=endDat.getTime();
                      var filterVisible=false;
                      if(req.body.dateSelected!=='no'){
                          var allOrders1=[];
                          allOrders.map((orders)=>{
                          if(orders.createdAt>=startDat&&orders.createdAt<=endDat){
                              allOrders1.push(orders);
                          }
                      })
                      filterVisible=true;
                      allOrders=allOrders1;
                      }
                      return res.ok({
                          status: 200,
                          allOrders: allOrders,
                          filterVisible:filterVisible
                      })
                  } catch (error) {
                      return res.serverError({
                          status: 500,
                          msg: error
                      });
                  }
              }
              else{
                  return res.json({
                          status: 401
                      });
              }
      },
      getRecentOrders: async (req, res) => {
        startDate=new Date(req.body.startDate);
       startDate=startDate.getTime();
        endDate=new Date(req.body.endDate);
       endDate.setDate(endDate.getDate());
       endDate=endDate.getTime();
       dateSelected=req.body.dateSelected;
       var verified=jwt.verify(req.body.token,sails.config.secret.key);
       if(verified){
              try {
                  let recentOrders = await Orders.find();
                 
                  var filterVisible=false;
                  if(req.body.dateSelected!=='no'){
                      var recentOrders1=[];
                  recentOrders.map((orders)=>{
                      if(orders.createdAt>=startDate&&orders.createdAt<=endDate){
                          recentOrders1.push(orders);
                      }
                  })
                  filterVisible=true;
                  recentOrders=recentOrders1;
                  }
                  let groupedItems = await Orders.consolidateOrders(startDate,endDate,dateSelected);
                 
                  return res.ok({
                      status: 200,
                      recentOrders: recentOrders,
                      groupedItems: groupedItems,
                      filterVisible:filterVisible
                  });
              } catch (error) {
                  return res.serverError({
                      status: 500,
                      msg: error
                  });
              }
          }
          else{
              return res.json({
                  status: 401
              })
          }
  },
  getOrderById:async function(req,res){
      Orders.findOne({orderid:parseInt(req.body.orderId)},function(err,data){
          if(err){
              res.json({status:false})
          }
          else{
            
              res.json({status:true,data:data})
          }
      })
  },
  markAsDelivered: async (req, res) => {
   
    try {
        await Orders.findOne({orderid:req.body.orderId},(err,data)=>{
            if(err) res.json({status:false});
            else{
                var amount=(data.method==='Cash On Delivery')?parseInt(data.totalamount):0;
                var a={"service_options":[{"type":"cod","cod_value":{"currency":"INR","amount":2000}}]}
                var items=[{"description":"","origin_country":"IND","quantity":"","price":{"amount":"","currency":"INR"},"weight":{"value":"","unit":""},"sku":""}];
                var price={};
                var weight={};
                data['items'].map((products,i)=>{
                    items[i]["description"]=products.Name
                    items[i]["quantity"]=products.Quantity
                    price["amount"]=products.Price
                    price["currency"]="INR"
                    items[i]["price"]=price
                    weight["value"]=products.weight
                    weight["unit"]="g"
                    items[i]["weight"]=weight
                    items[i]["sku"]=products.Name
                })
               
                var body={"async":false,
                "return_shipment":false,
                "paper_size":"default",
                "service_type":"bluedart_dart_apex",
                "is_document":false,
                "billing":{"paid_by":"shipper"},
                "customs":{"billing":{"paid_by":"recipient"},"purpose":"merchandise"},
                "service_options":[{"type":"cod","cod_value":{"currency":"INR","amount":amount}}],
                "shipper_account":{"id":"c4d22954-28ba-4fbd-acac-b80d2e3b497d"},
                "references":[],
                "shipment":{
                    "parcels":[
                        {"description":"Deliver faster","box_type":"custom","weight":{"value":parseInt(data.totalWeight),"unit":"g"},"dimension":{"width":parseInt(data.totalWidth),"height":parseInt(data.totalHeight),"depth":parseInt(data.totalDepth),"unit":"cm"},"items":items}],
                        "ship_from":{"contact_name":"Jameson McLaughlin","company_name":"Bode, Lind and Powlowski","email":"jameson@yahoo.com","phone":"12345678910","street1":"8918 Borer Ramp","city":"Nord-Trøndelag","state":"CA","postal_code":"560084","country":"IND","type":"business"},
                        "ship_to":{"contact_name":data.userName,"phone":data.mobile,"email":data.mobile,"street1":data.Address,"city":data.city,"postal_code":data.Pincode,"state":data.state,"country":"IND","type":"residential"}}
                    }
                if(amount===0){
                    delete body['service_options'];
                }
        var request = require("request");
        var options = {
            method: 'POST',
            url: 'https://sandbox-api.postmen.com/v3/labels',
            headers: {
                'content-type': 'application/json',
                'postmen-api-key': 'ba7df478-5e94-4b0f-9dcb-880eaed00305'
            },
            body: JSON.stringify(body)
        };
        
        request(options, async function (error, response, body) {
            if (error) throw new Error(error);
            else{
                var response=JSON.parse(body);
                if(response.meta.code===200){
                await Orders.update({ orderid: req.body.orderId }).set({orderStatus:'OrderDispatched',label:response.data.files.label.url,tracking_number:response.data.tracking_numbers[0]}).fetch().exec((err,data)=>{
                    transporter.sendMail({
                        to:data[0].email,
                        subject:'Order Dispatched',
                        html:`Order Id: <p>${data[0].orderid}</p> Order Date:<p>${data[0].date}</p> Label reference for your order <p>${response.data.files.label.url}</p> <p>https://www.bluedart.com/tracking</p> Tracking Number: <p>${response.data.tracking_numbers[0]}</p> `,
                    });
                });
                res.ok({
                  status: 200,
                  msg: 'Marked as Delivered'
                });
            }
            else{
                res.json({status:false});
            }
            }
        });
    }
    })
        } catch (error) {
        return res.serverError({
          status: 500,
          msg: error
        });
    }
},
};

