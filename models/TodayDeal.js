const mongoose = require('mongoose');

const todayDealSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    model_name:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product_categories",
        required:true
    },
    starting_price:{
        type:Number,
        required:true
    }
})


module.exports = mongoose.model("deals", todayDealSchema)