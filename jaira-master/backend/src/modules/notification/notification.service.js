import NotificationModel from "../../models/notification.model.js";

export const listNotifications = async (req, res, next) => {
  try {
    const { unread, page, limit } = req.query;
    const filter = { user: req.user._id };
    if (unread === "true") filter.isRead = false;
    const [notifications, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      NotificationModel.countDocuments(filter),
    ]);
    return res.status(200).json({ message: "notifications fetched", notifications, total, page, limit });
  } catch (error) { return next(error); }
};

export const markRead = async (req, res, next) => {
  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    );
    if (!notification) return res.status(404).json({ message: "notification not found" });
    return res.status(200).json({ message: "notification marked as read", notification });
  } catch (error) { return next(error); }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await NotificationModel.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ message: "notifications marked as read", modified: result.modifiedCount });
  } catch (error) { return next(error); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await NotificationModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: "notification not found" });
    return res.status(200).json({ message: "notification deleted" });
  } catch (error) { return next(error); }
};


