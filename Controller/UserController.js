const User = require("../model/user.model");
const GetDataUri = require("../utlis/dataUri");
const cloudinary = require("../utlis/cloudinaryImage.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Controller for user registration
exports.RegisterController = async (req, res) => {
    try {
        const { email, password, userName } = req.body;
        if (!email || !password || !userName) {
            return res.status(400).json({
                success: false,
                message: "User details are incomplete.",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists. Please use a different email.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            userName,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
        });
    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating account.",
        });
    }
};

// Controller for user login
exports.LoginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT, {
            expiresIn: "1d",
        });

        return res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }).json({
            success: true,
            message: `Welcome back ${user.userName}`,
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                followers: user.followers,
                following: user.following,
                posts: user.posts,
            },
        });
    } catch (error) {
        console.error("Error in user login:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });
    }
};

// Controller for user logout
exports.logout = async (_, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error("Error in user logout:", error);
        return res.status(500).json({
            success: false,
            message: "Error logging out.",
        });
    }
};


exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select("-password")
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};




// Controller for editing user profile
exports.editProfile = async (req, res) => {
    try {
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = GetDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
                }

                const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
        });
    } catch (error) {
        console.error("Error in editing profile:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating profile.",
        });
    }
};

// Controller for getting suggested users (excluding current user)
exports.getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.userId } }).select(
            "-password"
        );
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers,
        });
    } catch (error) {
        console.error("Error in getting suggested users:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching suggested users.",
        });
    }
};

// Controller for following or unfollowing a user
exports.followOrUnfollow = async (req, res) => {
    try {
        const userId = req.userId;
        const targetUserId = req.params.id;

        if (userId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow/unfollow yourself.",
            });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetUserId);

        if (!user || !targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const isFollowing = user.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne({ _id: userId }, { $pull: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $pull: { followers: userId } }),
            ]);
            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully.",
            });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne({ _id: userId }, { $push: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $push: { followers: userId } }),
            ]);
            return res.status(200).json({
                success: true,
                message: "Followed successfully.",
            });
        }
    } catch (error) {
        console.error("Error in following/unfollowing user:", error);
        return res.status(500).json({
            success: false,
            message: "Error following/unfollowing user.",
        });
    }
};
