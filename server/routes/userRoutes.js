import express from 'express';
import { protectRoute } from '../middleware/auth.js';
// ...existing code...
import {login, signup, updateProfile,checkAuth }  from '../controllers/userController.js';
//import { login } from "../controllers/userController.js";


const userRouter = express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check",protectRoute,checkAuth);

export default userRouter;