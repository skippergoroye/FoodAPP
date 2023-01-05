import express from "express";
import { auth } from "../middleware/authorization";
import { AdminRegister } from "../controller/adminController";


const router = express.Router();

router.post('/signup', AdminRegister)



export default router;
