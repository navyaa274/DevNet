import express from "express";
import { loginUser, logoutUser, registerUser, resendLoginOtp, resendOtp, verifyLoginOtp, verifyUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

export const userRouter = express.Router();

userRouter.post("/register", registerUser)

userRouter.post("/verify/:id", verifyUser);

userRouter.get("/resend/:id", resendOtp);

userRouter.post("/login", loginUser);

userRouter.post("/login/verify/:id", verifyLoginOtp);

userRouter.get("/login/resend/:id", resendLoginOtp);

userRouter.get("/logout", isAuthenticated, logoutUser);

export default userRouter