const mongoose = require('mongoose')

let categoriesSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    slug:{
        type:String,
        
    }
    
})

module.exports = mongoose.model('categories', categoriesSchema);