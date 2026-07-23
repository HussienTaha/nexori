import NotificationModel from "../models/notification.model.js";
import { emitToUser } from "../sockets/socket.js";

export const createNotification = async ({ user, message, type = "system", relatedId }) => {
  const notification = await NotificationModel.create({ user, message, type, relatedId });
  emitToUser(user, "notification:new", { notification });
  return notification;
};

export const createNotifications = async ({ userIds, actorId, message, type, relatedId }) => {
  const recipients = [...new Set(userIds.map(String))].filter((id) => id !== actorId?.toString());
  return Promise.all(recipients.map((user) => createNotification({ user, message, type, relatedId })));
};
