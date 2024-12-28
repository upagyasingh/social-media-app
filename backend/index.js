// to run the project and create api routes
import express from "express";
import dotenv from 'dotenv';
import authRoutes from './routes/auth-route.js'
import { connectDB } from "./db/index.js";
import cookieParser from "cookie-parser";
dotenv.config()
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/auth",authRoutes)

app.get("/",(req,res)=>{
    res.send("server is ready")
})
const port = process.env.PORT || 8000
app.listen(port, (err) => {
  console.log(`app running at ${port}`);
  connectDB()
});
