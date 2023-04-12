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
        res.status(500).json({ message: err.message })
    }
}

/*SEARCH  USERS*/

export const searchUser = async (req, res) => {
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
    try {
        const { id } = req.params;
        const response = await Post.updateOne({ _id: ObjectId(id) }, { isDeleted: true });
        res.status(200).json({ message: "Post deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/*SEARCH  POSTS*/

export const searchPost = async (req, res) => {
    const { key } = req.params
    try {
        const allPosts = await Post.find()
            .populate('author', 'username profilePic')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'username profilePic' },
                options: { sort: { createdAt: -1 } }
            })
            .exec();
        const regex = new RegExp(key, "i");
        const filteredArr = allPosts.filter(obj => regex.test(obj.author.username));
        res.status(200).json(filteredArr);
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

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

/*GET POSTSBYMONTH*/

export const getPostsByMonth = async (req, res) => {
    try {
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2023-12-31');
        const months = getMonthsInRange(startDate, endDate);

        const results = await Post.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    count: 1
                }
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            k: '$month',
                            v: '$count'
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    data: {
                        $arrayToObject: '$data'
                    }
                }
            }
        ]);
        // Combine the results with the months array to ensure all months are included
        const finalResults = months.map(month => {
            return {
                month: month,
                count: results[0].data[month] || 0
            }
        });
        res.status(200).json(finalResults);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Custom function to get all months in range
function getMonthsInRange(startDate, endDate) {
    const months = []
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        months.push(currentDate.toISOString().substring(0, 7));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return months;
}
