import express from "express";
const router = express.Router();
import { login,getallUsers,blockuser,searchUser,getallPosts,deletePost,searchPost,getDashboardCount,getPostsByMonth} from "../controllers/adminController.js";

/*AUTH ROUTES*/
router.post('/login', login);

/*USER ACTIONS*/

router.get('/getallusers',getallUsers)
router.put('/userblock/:id',blockuser)
router.get('/searchUser/:key',searchUser)

/*POST ACTIONS*/

router.get('/getallposts',getallPosts)
router.put('/deletePost/:id',deletePost)
router.get('/searchPost/:key',searchPost)

router.get('/getDashboardCount',getDashboardCount)
router.get('/getPostByMonth',getPostsByMonth)



export default router;