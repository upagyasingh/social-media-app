import bcrypt from 'bcryptjs'
import { generateTokenandSetCookie } from '../lib/generateTokenandSetCookie.js';
import User from '../models/user.model.js';
export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    // apply validation using zod

    const emailReg = /[a-zA-Z0-9.*%±]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/;
    if (!emailReg.test(email)) {
      return res.status(400).json({message: "Invalid email format" });
    }

    // valdiation for existing user

    const existingUser = await User.findOne({ username: username });
    if (existingUser)
      return res.status(400).json({message: "username is already taken" });


    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({message: "email is  already taken" });

    if(password.length<8) return res.status(400).json({message :"please enter a password of length greater than 8"});

    // hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(password,salt)

    const newUser = new User({
      fullname : fullname,
      username : username,
      email,
      password : hashPass,
    })

    if(newUser){
      generateTokenandSetCookie(newUser._id,res)
      await newUser.save()

      return res.status(201).json({message :"User created successfully",data:{
        _id : newUser._id,
        fullname : newUser.fullname,
        username :newUser.username,
        email :  newUser.email,
        followers : newUser.followers,
        following : newUser.following,
        profileimg : newUser.profileimg,
        coverimg : newUser.coverimg

      }})
    }else{
      return res.status(400).json({message :"Invalid user data"})
    }

  } catch (error) {
    console.log(" error in signup controller  ",error);
    return res.status(500).json({message :"Invalid server error"})
  }
};

export const login = async (req, res) => {
  try {
    const {username , password} = req.body;
    const user = await User.findOne({username : username})
    const isPasswordCorrect = await bcrypt.compare(password,user?.password || "")
    if(!user || !isPasswordCorrect) return res.status(400).json({message : "invalid username or password"})

    generateTokenandSetCookie(user._id,res)

    return res.status(200).json({message :"LoggedIn created successfully",data:{
      _id : user._id,
      fullname : user.fullname,
      username :user.username,
      email :  user.email,
      followers : user.followers,
      following : user.following,
      profileimg : user.profileimg,
      coverimg : user.coverimg

    }})

  } catch (error) {
    console.log("error in login controller ",error)
    return res.status(500).json({message :"Invalid server error"})
    
  }

};

export const logout = async (req, res) => {
  try {
      res.cookie("jwt","",{maxAge:0})
      res.status(200).json({message : "logged out successfully"})
  } catch (error) {
    console.log(" error in logout controller ",error)
    return res.status(500).json({message :"Invalid server error"})
  }
};


export const getMe = async (req,res)=>{
    try {
      console.log(req)
      
      const user = await User.findById(req.user.id).select("-password");
      return  res.status(200).json(user)
    } catch (error) {
      console.log(" error in getMe ",error)
    }
}