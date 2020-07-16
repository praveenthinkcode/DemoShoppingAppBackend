/**
 * Cartitems.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    Name:{
      type:"string",
      required:true
    },
    Price:{
      type:"number",
      required:true
    },
    Link:{
      type:"string",
      required:true
    },
    Quantity:{
      type:"number",
      required:true
    },
    productId:{
      type:"string",
      required:true
    },
    userid:{
      type:"number",
      required:false
    },
    DiscountedPrice:{
      type:"number"
    }
  },
  datastore:'mongodb'

};

