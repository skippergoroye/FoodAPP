import express from 'express';
import { Login, Register, verifyUser } from '../controller/userController';


const router = express.Router()

router.post('/signup', Register);
router.post("/verify/:signature", verifyUser);
router.post("/login", Login);



export default router;