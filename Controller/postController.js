const sharp = require("sharp");
const cloudinary = require("../utlis/cloudinaryImage");
const Post = require("../model/post.model");
const User = require("../model/user.model");
const Comment = require("../model/Comment.model");





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



const fileUri = `data:image/jpeg;base64,${OptimizeImageFile.toString('base64')}`;

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
            // const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            // io.to(postOwnerSocketId).emit('notification', notification);
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

exports.addComment = async (req,res) =>{
    try {
        const postId = req.params.id;
        const CommentedUser = req.id;

        const {text} = req.body;

        const post = await Post.findById(postId);

        if(!text) return res.status(400).json({message:'text is required', success:false});

        const comment = await Comment.create({
            text,
            author:CommentedUser,
            post:postId
        })

        await comment.populate({
            path:'author',
            select:"username profilePicture"
        });
        
        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message:'Comment Added',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
    }
};




exports.getCommentsOfPost = async (req,res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');

        if(!comments) return res.status(404).json({message:'No comments found for this post', success:false});

        return res.status(200).json({success:true,comments});

    } catch (error) {
        console.log(error);
    }
}





exports.deletePost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});

        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        await Comment.deleteMany({post:postId});

        return res.status(200).json({
            success:true,
            message:'Post deleted'
        })

    } catch (error) {
        console.log(error);
    }
}




exports.bookmarkPost = async (req,res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found', success:false});
        
        const user = await User.findById(authorId);
        if(user.bookmarks.includes(post._id)){
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Post removed from bookmark', success:true});

        }else{
            // bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved', message:'Post bookmarked', success:true});
        }

    } catch (error) {
        console.log(error);
    }
}


