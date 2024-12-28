import jwt from 'jsonwebtoken'

export const generateTokenandSetCookie = async (id,res)=>{
    const token = jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:"15d"
    })
    res.cookie("jwt",token,{
    maxAge : 15*24*60*60*1000,
    httpOnly : true,//not to accessible by any other injected js
    sameSite :"strict",
    secure : process.env.NODE_ENV !== "development"
})
}