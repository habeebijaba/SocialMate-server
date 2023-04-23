import express from "express";
const router = express.Router();
import { login,
        getallUsers,
        blockuser,
        searchUser,
        getallPosts,
        deletePost,
        searchPost,
        getDashboardCount,
        getPostsByMonth,
        getNotifications,
        reportPost,
        getrequestCount} from "../controllers/adminController.js";

/*AUTH ROUTES*/
router.post('/login', login);

/*USER ACTIONS*/

router.get('/getallusers',getallUsers)
router.put('/userblock/:id',blockuser)
router.get('/searchUser/:key',searchUser)

/*POST ACTIONS*/

router.get('/getallposts',getallPosts)
router.put('/deletePost/:id',deletePost)
router.put('/reportPost/:id',reportPost)

router.get('/searchPost/:key',searchPost)

router.get('/getDashboardCount',getDashboardCount)
router.get('/getPostByMonth',getPostsByMonth)
router.get('/getNotifications',getNotifications)
router.get('/getrequestCount',getrequestCount)

export default router;