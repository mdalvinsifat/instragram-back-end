  const sharp = require("sharp");
  const cloudinary = require("../utlis/cloudinaryImage");
  const Post = require("../model/post.model");
  const User = require("../model/user.model");
  const Comment = require("../model/comment.model");
const { getReceiverSocketId, io } = require("../socket/socket");

  // Add a new post
  exports.addNewPost = async (req, res) => {
    try {
      const { caption } = req.body;
      const image =req.file;
      const authorId = req.id;

      if (!image) return res.status(400).json({ message: 'Image required' });

      const optimizedImageBuffer = await sharp(image.buffer)
              .resize({ width: 800, height: 800, fit: 'inside' })
              .toFormat('jpeg', { quality: 80 })
              .toBuffer();



      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      const post = await Post.create({
        caption,
        image: cloudResponse.secure_url,
        author: authorId,
      });

      const user = await User.findById(authorId);
      if (user) {
        user.posts.push(post._id);
        await user.save();
      }

      await post.populate({ path: "author", select: "-password" });

      return res.status(201).json({
        message: "New post added",
        post,
        success: true,
      });
    } catch (error) {
      console.error("Add Post Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Get all posts (public feed)
  exports.getAllPost = async (req, res) => {
    try {
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate({ path: "author", select: "userName profilePicture" })
        .populate({
          path: "comments",
          sort: { createdAt: -1 },
          populate: {
            path: "author",
            select: "userName profilePicture",
          },
        });

      return res.status(200).json({ posts, success: true });
    } catch (error) {
      console.error("Get All Posts Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Get posts of logged-in user
  exports.getUserPost = async (req, res) => {
    try {
      const authorId = req.id;

      const posts = await Post.find({ author: authorId })
        .sort({ createdAt: -1 })
        .populate({
          path: "author",
          select: "userName profilePicture",
        })
        .populate({
          path: "comments",
          sort: { createdAt: -1 },
          populate: {
            path: "author",
            select: "userName profilePicture",
          },
        });

      return res.status(200).json({ posts, success: true });
    } catch (error) {
      console.error("Get User Posts Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Like post
  exports.likePost = async (req, res) => {
    try {
      const userId = req.id;
      const postId = req.params.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });

      await post.updateOne({ $addToSet: { likes: userId } });
      await post.save();

        const user = await User.findById(userId).select('username profilePicture');

           const postOwnerId = post.author.toString();
        if(postOwnerId !== userId){
            // emit a notification event
            const notification = {
                type:'like',
                userId:userId,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }

            const postOwnerSocketIo = getReceiverSocketId(postOwnerId)
                    io.to(postOwnerSocketId).emit('notification', notification);
          }



      return res.status(200).json({ message: "Post liked", success: true });
    } catch (error) {
      console.error("Like Post Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Dislike post
  exports.dislikePost = async (req, res) => {
    try {
      const userId = req.id;
      const postId = req.params.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });

      await post.updateOne({ $pull: { likes: userId } });
      await post.save();

      
   const user = await User.findById(userId).select('username profilePicture');

           const postOwnerId = post.author.toString();
        if(postOwnerId !== userId){
            // emit a notification event
            const notification = {
                type:'dislike',
                userId:userId,
                userDetails:user,
                postId,
                message:'Your post was dislike'
            }

            const postOwnerSocketIo = getReceiverSocketId(postOwnerId)
                    io.to(postOwnerSocketId).emit('notification', notification);
          }
      return res.status(200).json({ message: "Post disliked", success: true });
    } catch (error) {
      console.error("Dislike Post Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Add comment
  exports.addComment = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.id;
      const { text } = req.body;

      if (!text) return res.status(400).json({ message: "Text is required", success: false });

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });

      const comment = await Comment.create({ text, author: userId, post: postId });

      await comment.populate({ path: "author", select: "userName profilePicture" });

      post.comments.push(comment._id);
      await post.save();

      return res.status(201).json({ message: "Comment added", comment, success: true });
    } catch (error) {
      console.error("Add Comment Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Get comments of post
  exports.getCommentsOfPost = async (req, res) => {
    try {
      const postId = req.params.id;

      const comments = await Comment.find({ post: postId }).populate("author", "userName profilePicture");

      return res.status(200).json({ comments, success: true });
    } catch (error) {
      console.error("Get Comments Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Delete post
  exports.deletePost = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });

      if (post.author.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized", success: false });
      }

      await Post.findByIdAndDelete(postId);

      const user = await User.findById(userId);
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();

      await Comment.deleteMany({ post: postId });

      return res.status(200).json({ message: "Post deleted", success: true });
    } catch (error) {
      console.error("Delete Post Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  // Bookmark post
  exports.bookmarkPost = async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });

      const user = await User.findById(userId);
      const isBookmarked = user.bookmarks.includes(post._id);

      if (isBookmarked) {
        await user.updateOne({ $pull: { bookmarks: post._id } });
        return res.status(200).json({ type: "unsaved", message: "Bookmark removed", success: true });
      } else {
        await user.updateOne({ $addToSet: { bookmarks: post._id } });
        return res.status(200).json({ type: "saved", message: "Post bookmarked", success: true });
      }
    } catch (error) {
      console.error("Bookmark Post Error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };
