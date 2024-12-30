// to run the project and create api routes
import express from "express";
import dotenv from 'dotenv';
import authRoutes from './routes/auth-route.js'
import userRoutes from './routes/user-route.js'
import postRoutes from './routes/post-route.js'
import notificationRoutes from './routes/notification-route.js'
import { connectDB } from "./db/index.js";
import path from 'path'
import cookieParser from "cookie-parser";

import { v2 as cloudinary } from "cloudinary";
dotenv.config()
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
})
const __dirname = path.resolve()
const app = express();

app.use(express.json({limit:"5mb"}))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth",authRoutes)
app.use("/api/users",userRoutes)
app.use("/api/posts",postRoutes)
app.use("/api/notifications",notificationRoutes)

if(process.env.NODE_ENV==="production"){ app.use(express.static(path.join(__dirname,"frontend/dist")))

  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
  })
}

app.get("/",(req,res)=>{
    res.send("server is ready")
})
const port = process.env.PORT || 8000
app.listen(port, (err) => {
  console.log(`app running at ${port}`);
  connectDB()
});
