import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createaAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length == 0) return res.status(200).json([]);
    return res.status(200).json(posts);
  } catch (error) {
    console.log("error in get all post controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ messsage: "User not found" });
    if (!text && !img)
      return res
        .status(400)
        .json({ messsage: "Post must have a text or image" });

    if (img) {
      const uploadRes = await cloudinary.uploader.upload(img);
      img = uploadRes.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    return res.status(200).json({ messsage: "Post created Successfully" });
  } catch (error) {
    console.log("error in create post controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const likeUnklikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    // search for that post
    const post = await Post.findById(postId);

    if (!post) return res.status(400).json({ messsage: "Post not found" });

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // dislike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likePosts: postId } });
      const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
    } else {
      // like
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likePosts: postId } });

      // both are same
      // post.likes.push(userId);
      // await post.save()

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();

      const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);

      }
  } catch (error) {
    console.log("error in create like / unlike post controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text)
      return res.status(400).json({ messsage: "Text field is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ messsage: "Post not found" });
    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();

    return res.status(200).json({ messsage: "Commented successfully" });
  } catch (error) {
    console.log("error in create comment on Post controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ messsage: "Post not found" });
    if (post.user.toString() !== req.user._id.toString())
      return res
        .status(400)
        .json({ messsage: "You are not authorized to delete this post" });
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ messsage: "Post deleted successfully" });
  } catch (error) {
    console.log("error in create delete controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ messsage: "User not found" });
    const likedPosts = await Post.find({ _id: { $in: user.likedpost } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("error in getLikedPosts controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ messsage: "User not found" });
    const following = user.following;

    const feedPost = await Post.find({ user: { $in: following } })
      .sort({ createaAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(feedPost);
  } catch (error) {
    console.log("error in getFollowingPost controller ", error);
    return res.status(500).json({ messsage: "Internal Server error" });
  }
};

export const getUserPost = async (req,res)=>{
    try {
        const {username} = req.params
        const user = await User.findOne({username})
        if (!user) return res.status(400).json({ messsage: "User not found" });
    
        const feedPost = await Post.find({ user: user._id })
          .sort({ createaAt: -1 })
          .populate({ path: "user", select: "-password" })
          .populate({ path: "comments.user", select: "-password" });
    
        return res.status(200).json(feedPost);
      } catch (error) {
        console.log("error in getFollowingPost controller ", error);
        return res.status(500).json({ messsage: "Internal Server error" });
      }
}