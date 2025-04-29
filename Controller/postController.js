const sharp = require("sharp");
const cloudinary = require("../utlis/cloudinaryImage");
const Post = require("../model/post.model");
const User = require("../model/user.model");





exports.AddnewPost = async(req, res ) =>{
    try {
        const {caption} =req.body ; 
        const image = req.files ; 


        const authorId = req.id 

        if(!image){
            res.statu(501).send({
                success:false , 
                message:"image is required"
            })
        }


        const OptimizeImageFile = await sharp(image.buffer).resize({width:800, height:800}).toFormat("jpeg", {quality:80}).toBuffer();



const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

const cloudResponse = await cloudinary.uploader.upload(fileUri)


const post = await Post.create({
    caption,
    image: cloudResponse.secure_url,
    author: authorId
})

const user = await User.findById(authorId)

if(user){
    user.posts.push(post._id)
    await user.save()
}



await post.populate({ path: 'author', select: '-password' });

return res.status(201).json({
    message: 'New post added',
    post,
    success: true,
})


    } catch (error) {
        console.log(error)

    }
}





exports.getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'userName, profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'userName, profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}