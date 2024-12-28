import bcrypt from 'bcryptjs'
import { generateTokenandSetCookie } from '../lib/generateTokenandSetCookie.js';
import User from '../models/user.model.js';
export const signup = async (req, res) => {
  try {
    const { fullName, userName, email, password } = req.body;

    // apply validation using zod

    const emailReg = /[a-zA-Z0-9.*%±]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}/;
    if (!emailReg.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // valdiation for existing user

    const existingUser = await User.findOne({ username: userName });
    if (existingUser)
      return res.status(400).json({ error: "username is already taken" });


    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ error: "email is  already taken" });


    // hashing the password
    const salt = await bcrypt.genSalt(10)
    const hashPass = await bcrypt.hash(password,salt)

    const newUser = new User({
      fullname : fullName,
      username : userName,
      email,
      password : hashPass,
    })

    if(newUser){
      generateTokenandSetCookie(newUser._id,res)
      await newUser.save()

      return res.status(201).json({error :"User created successfully"})
    }else{
      return res.status(400).json({error :"Invalid user data"})
    }

  } catch (error) {
    console.log(" error in signup controller  ",error);
    return res.status(500).json({error :"Invalid server error"})
  }
};

export const login = async (req, res) => {
  res.json({
    data: "login",
  });
};

export const logout = async (req, res) => {
  res.json({
    data: "logout",
  });
};
