import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";




export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(400).json({ message: "user not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.log(" error in user controller ", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "you cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ message: "user not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      return res.status(200).json({ message: "unfollowed successfully" });
    } else {
      // follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // send notification
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify.id,
      });

      await newNotification.save();
    }
  } catch (error) {
    console.log(" error in follow unfollow controller ", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getSuggestedUser = async (req, res) => {
  const userId = req.user._id;

  const usersFollowedByMe = await User.findById(userId).select("following");

  const users = await User.aggregate([
    {
      $match: {
        _id: { $ne: userId },
      },
    },
    { $sample: { size: 10 } },
  ]);

  const filteredUsers = users.filter(
    (user) => !usersFollowedByMe.following.includes(user._id)
  );
  const suggestedUser = filteredUsers.slice(0, 4);
  suggestedUser.forEach((user) => (user.password = null));

  res.status(200).json(suggestedUser);
};
export const updateUserProfile = async (re, res) => {
  const { fullname, username, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileimg, coverimg } = req.body;

  const userId = req._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found" });
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword))
      return res
        .status(400)
        .json({ message: "Please provide both current and new password" });

    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      if (newPassword.length < 8)
        return res
          .status(400)
          .json({ message: "Password must atleast contain  characters" });

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword,salt);
    }

    if(profileimg)
      {
        if(user.profileimg){
          await cloudinary.uploader.destroy(user.profileimg.split("/").pop().split(".")[0])
        }
        const uploadedRes = await cloudinary.uploader.upload(profileimg)
        profileimg = uploadedRes.secure_url;
      }
    if(coverimg){
      if(user.coverimg){
        await cloudinary.uploader.destroy(user.coverimg.split("/").pop().split(".")[0])
      }
      const uploadedRes = await cloudinary.uploader.upload(coverimg)
      coverimg = uploadedRes.secure_url;
    }

    user.fullname = fullname || user.fullname
    user.username = username || user.username
    user.email = email || user.email
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileimg = profileimg || user.profileimg
    user.coverimg = coverimg || user.coverimg

    user = await user.save()

    user.password = null

    return res.status(200).json(user)

  } catch (error) {
    console.log("error in update User ", error);
    return res.status(500).json({ message: "internal server errord" });
  }
};
