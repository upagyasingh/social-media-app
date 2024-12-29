import Notification from "../models/notification.model.js";

export const getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileimg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notification);
  } catch (error) {
    console.log("error in the notification controller ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });
    return res
      .status(200)
      .json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log("error in  the delete notification controller ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteOneNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notiId = req.params;
    const notifications = await Notification.findById({ notiId });
    if (!notifications)
      return res.status(400).json({ messsage: "Notification not found" });
    if (notifications.to.toString() != userId.toString())
      return res
        .status(400)
        .json({ messsage: "You are not allowed to delete this" });
    await Notification.findByIdAndDelete(notiId);

    return res
      .status(200)
      .json({ message: "notification deleted successfully" });
  } catch (error) {
    console.log("error in  the delete notification controller ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
