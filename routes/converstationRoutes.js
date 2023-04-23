import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createConverstation, getConverstation ,getConverstationCount} from "../controllers/converstationController.js";
const router = express.Router();

/* New */
router.post('/', verifyToken, createConverstation)

/* Get user converstation */
router.get('/:converstationId', verifyToken, getConverstation)
router.get('/converstationCount/:userId',getConverstationCount)

export default router;