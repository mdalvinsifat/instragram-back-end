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

// this post see all 
// ai post sobai dekhbe Home bar er moto 
exports.getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'userName profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'userName profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
};




// this post just for userProfile need 
// ai post ta jar profile se dekhbe just r kao na 

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









exports.likePost = async (req, res) => {
    try {
        const Likedusers = req.id;
        const postId = req.params.id; 
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: Likedusers } });
        await post.save();

        const user = await User.findById(Likedusers).select('username profilePicture');
         
        const postOwnerId = post.author.toString();
        if(postOwnerId !== Likedusers){
            const notification = {
                type:'like',
                userId:Likedusers,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {

    }
}




exports.dislikePost = async (req, res) => {
    try {
        const Likedusers = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        await post.updateOne({ $pull: { likes: Likedusers } });
        await post.save();

        const user = await User.findById(Likedusers).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== Likedusers){
            const notification = {
                type:'dislike',
                userId:Likedusers,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }



        return res.status(200).json({message:'Post disliked', success:true});
    } catch (error) {

    }
}





