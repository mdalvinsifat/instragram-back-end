const express = require("express")
const cors = require("cors")
const dotenv = require('dotenv')
const morgan = require("morgan")
const colors = require("colors")
const ConnectDB = require("./Config/ConnectDB")



const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
dotenv.config()
app.use( morgan("dev"))



const PORT = process.env.PORT || 3000 
ConnectDB()
app.listen(PORT , () => console.log(`http://localhost:${PORT}`.bgGreen))