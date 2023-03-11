const mongoose = require('mongoose')

let productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    img:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    offer:{
        type:Number
    },
    

    description:{
        type:String,
        required:true,
        trim:true
    },
    reviews:
        {
            userId:{type:mongoose.Schema.Types.ObjectId, ref:'users'},
            review:String,
        },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categories',
    },
    countInStock:{
        type:String,
        required:true,
        default:10
    }
    
})

module.exports = mongoose.model('products', productSchema);