import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from "../models/User.js";
import Post from '../models/Post.js'
const ObjectId = mongoose.Types.ObjectId;

const adminUsername = process.env.ADMIN_USERNAME
const adminPassword = process.env.ADMIN_PASSWORD;

/* LOGGING IN */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = (email === adminUsername) ? adminUsername : false;
        if (!admin) return res.status(400).json({ message: 'please enter valid email address' })
        const isMatch = (password === adminPassword) ? true : false;
        if (!isMatch) return res.status(400).json({ msg: "Incorrect Password entered" })
        const token = jwt.sign({ id: admin.adminUsername }, process.env.SECRET_KEY)
        res.status(200).json({ token, admin });
    }
    catch (err) {
        res.status(500).json({ msg: "Something went wrong in login " })
    }
}

/*GET ALL USERS*/

export const getallUsers = async (req, res) => {
    console.log("called for users");
    try {
        const allusers = await User.find()
        if (allusers) {
            return res.status(200).json(allusers)
        }
        else {
            const message = "Users not found"
            return res.status(404).json({ message })
        }

    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

/*Block  USER*/

export const blockuser = (req, res) => {
    try {
        const { id } = req.params;
        const checked = req.body.checked;
        if (checked) {
            User.updateOne({ _id: ObjectId(id) }, { isBlocked: false }).then((response) => {
                return res.status(200).json({ isBlocked: false })
            })
        } else {
            User.updateOne({ _id: ObjectId(id) }, { isBlocked: true }).then((response) => {
                return res.status(200).json({ isBlocked: true })
            })
        }
    } catch (err) {
        res.status(500).json({ message: error.message })
    }
}

/*SEARCH  USERS*/

export const searchUser = async (req, res) => {
    console.log("call on server siode");
    const { key } = req.params
    try {
        const users = await User.find({
            "$or": [
                {
                    username: { $regex: key }
                },
                {
                    email: { $regex: key }
                }
            ]
        })
        // console.log(users, "hey this is usesr from search");
        res.status(200).json(users);
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

/*GET  POSTS*/

export const getallPosts = async (req, res) => {
    try {
        //   const allPosts=await Post.find()
        const allPosts = await Post.find()
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(allPosts)
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

/*DELETE  POST*/

export const deletePost = async (req, res) => {
    console.log("called for delete");
    try {
        const { id } = req.params;
        console.log(id, "this is id");

        const response = await Post.updateOne({ _id: ObjectId(id) }, { isDeleted: true });
        console.log(response, "this is updated post");

        res.status(200).json({ message: "Post deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/*GET DASHBOARDCOUNTS*/

export const getDashboardCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments()
        const postCount = await Post.countDocuments()

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newUserCount = await User.countDocuments({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        const newPostCount = await Post.countDocuments({
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });

        let counts = {
            usercount: userCount,
            postcount: postCount,
            newuser: newUserCount,
            newpopst: newPostCount
        }
        res.status(200).json(counts)

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}