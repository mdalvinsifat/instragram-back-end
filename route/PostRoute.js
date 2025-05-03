

const express = require("express")
const { uploads } = require("../middlwares/multer")
const IsAuthenticated = require("../middlwares/IsAuthenticated")
const {addNewPost, getAllPost} = require("../Controller/postController")

const router = express.Router()



router.post("/addPost", IsAuthenticated, uploads.single("image"),addNewPost )
router.get("/allpost", IsAuthenticated,getAllPost)






module.exports = router ; 