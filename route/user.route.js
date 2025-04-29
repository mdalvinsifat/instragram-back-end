const express = require("express")
const { RegisterController, LoginController, editProfile, getProfile, getSuggestedUsers, followOrUnfollow, logout } = require("../Controller/UserController")
const { IsAuthentics } = require("../middlwares/IsAuthenticated")
const { uploads } = require("../middlwares/multer")

const router = express.Router()

router.post("/register", RegisterController)
router.post("/login", LoginController)
router.post("/edit", IsAuthentics, uploads.single("profilePicture"), editProfile) // 🔥
router.get("/suggest", IsAuthentics, getSuggestedUsers)
router.post("/followers/:id", IsAuthentics, followOrUnfollow)
router.get("/logOut", logout)
router.get("/:id/profile", IsAuthentics, getProfile) // 🔥

module.exports = router
