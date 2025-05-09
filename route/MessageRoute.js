const express = require("express")
const IsAuthenticated = require("../middlwares/IsAuthenticated")
const { sendMessage, getMessage } = require("../Controller/messageController")



const router = express.Router()



router.post("/send/:id", IsAuthenticated, sendMessage)
router.get("/all/:id", IsAuthenticated, getMessage)


module.exports = router