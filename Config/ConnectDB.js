const mongoose = require("mongoose")
const colors = require("colors")



const ConnectDB = async() =>{
    try {
        const res = await mongoose.connect(process.env.MONGOOSE_URL)
        console.log("Mongoose Connenct successfully".bgBlue)
    } catch (error) {
        console.log(error)
    }
}


module.exports = ConnectDB