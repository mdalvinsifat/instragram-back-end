

    const express = require("express")
    const { uploads } = require("../middlwares/multer")
    const IsAuthenticated = require("../middlwares/IsAuthenticated")
    const {addNewPost, getAllPost, deletePost, likePost, dislikePost, addComment} = require("../Controller/postController")

    const router = express.Router()



    router.post("/addPost", IsAuthenticated, uploads.single("image"),addNewPost )
    router.get("/allpost", IsAuthenticated,getAllPost)
    router.delete("/:id", IsAuthenticated,deletePost)
    router.get("/:id/like", IsAuthenticated,likePost)
    router.get("/:id/dislike", IsAuthenticated,dislikePost)
    router.post("/:id/commant", IsAuthenticated, addComment)





    module.exports = router ; 