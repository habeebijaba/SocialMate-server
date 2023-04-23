import Post from '../models/Post.js';
import cloudinary from '../config/cloudinery.js';
import Notification from '../models/Notifiaction.js';
import AdminNotifications from '../models/AdminNotifications.js';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId



export const createPost = async (req, res) => {
    try {

        const { content } = req.body;
        // if(!req.file.path){
        //     res.status(404).json(nofile)
        //     if(content.trim().length < 1 ){
        //     res.status(404).json(notext)
        //     }
        // }
        const { id } = req.user;
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Posts"
        });

        const newPost = new Post({
            content,
            author: id,
            image: result.secure_url,
            likes: {}
        });

        const savedPost = await newPost.save();
        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username profilePic')
            .populate('comments.author', 'username profilePic')
            .exec();

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};


export const getPosts = async (req, res) => {

    let skip = req.query.skip
    let userId = req.query.userId
    try {
        // const userId = req.user.id;
        // const user = await User.findById(userId).populate('friends');

        // const friendIds = user.friends?.map((friend) => friend._id);

        // const posts = await Post.find({ author: { $in: [...friendIds, user._id] } })
        //     .populate('author', 'username image')
        //     .populate('comments.author', 'username image')
        //     .sort({ createdAt: 'desc' })
        //     .exec();
        const posts = await Post.find({
            $and: [
                { author: { $ne: userId } },
                { isDeleted: false },
                {isReported: false},
                { reportedUsers: { $ne: userId } }

            ]
        })
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            // .skip(skip)
            // .limit(10)
            .exec();

        res.status(200).json(posts);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { loggedInUserId } = req.body;
        const post = await Post.findById(id);

        const isLiked = post.likes.get(loggedInUserId);

        if (isLiked) {
            post.likes.delete(loggedInUserId);
        } else {
            post.likes.set(loggedInUserId, true);
            const notification = new Notification({
                type: "like",
                user: post.author,
                friend: loggedInUserId,
                postId: post._id,
                content: 'Liked your post'
            })
            await notification.save();
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes },
            { new: true }
        );

        const populatedPost = await Post.findById(updatedPost._id)
            .populate('author', 'username profilePic')
            .populate('comments.author', 'username profilePic')
            .exec();

        res.status(200).json(populatedPost);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


export const commentPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, loggedInUserId } = req.body;
        if (comment.trim().length < 1) {
            res.status(404).json({ message: err.message });

        }
        const post = await Post.findById(id);
        post.comments.unshift({ text: comment, author: loggedInUserId, isDelete: false });
        const notification = new Notification({
            type: "Comment",
            user: post.author,
            friend: loggedInUserId,
            postId: post._id,
            content: 'commented on your post'
        })
        await notification.save();
        const savedPost = await post.save();

        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .exec();
        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

export const deleteComment = async (req, res) => {
    const { postId, createdAt } = req.body
    try {
        const result = await Post.updateOne(
            { _id: postId },
            { $pull: { comments: { createdAt: createdAt } } }
        );
        const populatedPost = await Post.findById(postId)
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .exec();
        res.status(201).json(populatedPost);

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


export const getUserPost = async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({
            $and: [
                { author: id },
                { isDeleted: false }
            ]
        })
            .populate('author', 'username profilePic')  
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(posts)
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const {userId}=req.body
        const response = await Post.updateOne({ _id: ObjectId(postId) }, { isDeleted: true });
        const posts = await Post.find({
            $and: [
                { author: userId },
                { isDeleted: false }
            ]
        })
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const reportPost=async(req,res)=>{
    const { postId } = req.params;
    const {reason}=req.body
    const{userId}=req.body
    try{
        const post = await Post.findById(postId);
        post.reportedUsers.push(userId);
        await post.save();
        const notification = new AdminNotifications({
            reason: reason?reason:'dont like it',
            user: userId,
            postId: postId,
            postOwner:post.author
            
        })
        await notification.save();

        const posts = await Post.find({
            $and: [
                { author: {$ne:userId} },
                { isDeleted: false },
                { reportedUsers: { $ne: userId } }
            ]
        })
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
           res.status(200).json(posts)
    }catch(err){
        res.status(404).json({message:err.message})
    }

}