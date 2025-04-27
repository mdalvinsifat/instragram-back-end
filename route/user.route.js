const express = require("express")
const { RegisterController, LoginController, editProfile, getProfile, getSuggestedUsers, followOrUnfollow } = require("../Controller/UserController")
const { IsAuthentics } = require("../middlwares/IsAuthenticated")
const { uploads } = require("../middlwares/multer")


const router = express.Router()



router.post("/register", RegisterController)
router.post("/login", LoginController)
router.get("/:id/profile", IsAuthentics,getProfile)
router.put("/profile/edit", IsAuthentics, uploads.single("profilePicture"), editProfile)
router.get("/suggest",IsAuthentics, getSuggestedUsers )
router.post("/followers/:id",IsAuthentics, followOrUnfollow)


module.exports = router