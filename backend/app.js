import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import path from "path"
import userRouter from "./routes/userRoute.js";
import cookieParser from "cookie-parser";


dotenv.config({ path: "./config/config.env" });

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.use(cors({
    origin: [process.env.LOCAL_URL, process.env.WEB_URL],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}))


app.use("/api/v1/user", userRouter);

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

export default app;