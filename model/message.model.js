const mongoose = require("mongoose")


const messageSchema = new mongoose.Schema({

    sendrId : {
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User"
    }, 
    reciveId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User"
    }, 
    message:{
        type:String , 
        required:true
    }
})


