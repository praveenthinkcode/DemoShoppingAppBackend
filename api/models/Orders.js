/**
 * Orders.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    // userid:{
    //   type:"number",
    // required:true
    // },
    // orderid:{
    //   type:'number',
    //   required:true
    // },
    // totalamount:{
    //   type:'number',
    //   required:true
    // }
  },
   datastore:'mongodb',
  consolidateOrders: async (startDate,endDate,dateSelected) => {
    let orderItems = await Orders.find({ orderStatus: 'OrderPlaced' });
    if(dateSelected!=='no'){
        var orderItems1=[];
        orderItems.map((orders)=>{
        if(orders.createdAt>=startDate&&orders.createdAt<=endDate){
            orderItems1.push(orders);
        }
    })
    orderItems=orderItems1;
    }
    let items = [];
    orderItems.map((orderItem) => {
        orderItem.items.map((item) => {
            items.push(item);
        });
    });
    let groupedItems = _.groupBy(items, 'Category');
    let consolidatedItems = [];
    Object.keys(groupedItems).map((key) => {
        let tempArr = [];
        groupedItems[key].map((item) => {
            if(tempArr.length === 0) {
                tempArr.push(item);
            } else {
                let flag = 0;
                tempArr.map((tempItem) => {
                    if(tempItem['id'] === item['id']) {
                        flag = 1;
                        var tempQuantity= parseInt(tempItem['Quantity']);
                        var itemQuantity= parseInt(item['Quantity']);
                        tempQuantity=tempQuantity+itemQuantity;
                        tempItem['Quantity']=tempQuantity;
                    }
                });
                if(flag === 0) {
                    tempArr.push(item);
                }
            }
        });
        groupedItems[key] = tempArr;
    });
    return groupedItems;
}

};

