const express = require("express")
const { RegisterController, LoginController, editProfile, getProfile, getSuggestedUsers, followOrUnfollow, logout } = require("../Controller/UserController")
const IsAuthenticated  = require("../middlwares/IsAuthenticated")
const { uploads } = require("../middlwares/multer")

const router = express.Router()

router.post("/register", RegisterController)
router.post("/login", LoginController)
router.post("/edit", IsAuthenticated, uploads.single("profilePicture"), editProfile) // 🔥
router.get("/suggested-user", IsAuthenticated, getSuggestedUsers)
router.post("/followers/:id", IsAuthenticated, followOrUnfollow)
router.get("/logOut", logout)
router.get("/:id/profile", IsAuthenticated, getProfile) // 🔥

module.exports = router
