import ChatModel from "../../models/chat.model.js";
import MessageModel from "../../models/message.model.js";
import UserModel from "../../models/user.model.js";
import TeamModel from "../../models/team.model.js";
import TaskModel from "../../models/task.model.js";
import { emitToRoom } from "../../sockets/socket.js";
import { createNotifications } from "../../service/notification.js";

const sameId = (left, right) => left?.toString() === right?.toString();

const canAccessChat = async (chat, userId) => {
  if (chat.type === "direct") return chat.participants.some((participant) => sameId(participant, userId));
  if (chat.team) {
    const team = await TeamModel.findById(chat.team).select("ownerId members");
    return Boolean(team && (sameId(team.ownerId, userId) || team.members.some((member) => sameId(member.user, userId))));
  }
  if (chat.task) {
    const task = await TaskModel.findById(chat.task).select("createdBy assignedTo team");
    if (!task) return false;
    if (sameId(task.createdBy, userId) || task.assignedTo.some((id) => sameId(id, userId))) return true;
    const team = task.team && await TeamModel.findById(task.team).select("ownerId members");
    return Boolean(team && (sameId(team.ownerId, userId) || team.members.some((member) => sameId(member.user, userId))));
  }
  return false;
};

const recipientsForChat = async (chat) => {
  if (chat.type === "direct") return chat.participants;
  if (chat.team) {
    const team = await TeamModel.findById(chat.team).select("ownerId members");
    return team ? [team.ownerId, ...team.members.map((member) => member.user)] : [];
  }
  if (chat.task) {
    const task = await TaskModel.findById(chat.task).select("createdBy assignedTo team");
    if (!task) return [];
    const team = task.team && await TeamModel.findById(task.team).select("ownerId members");
    return [...[task.createdBy, ...task.assignedTo], ...(team ? [team.ownerId, ...team.members.map((member) => member.user)] : [])];
  }
  return [];
};

export const listChats = async (req, res, next) => {
  try {
    const direct = await ChatModel.find({ type: "direct", participants: req.user._id });
    const teams = await TeamModel.find({ $or: [{ ownerId: req.user._id }, { "members.user": req.user._id }] }).select("_id");
    const chats = await ChatModel.find({ $or: [{ _id: { $in: direct.map((chat) => chat._id) } }, { team: { $in: teams.map((team) => team._id) } }] })
      .populate("team", "name image").populate("task", "title status").populate("participants", "name email image").populate("lastMessage").sort({ updatedAt: -1 });
    return res.status(200).json({ message: "chats fetched", chats });
  } catch (error) { return next(error); }
};

export const createDirectChat = async (req, res, next) => {
  try {
    const recipient = await UserModel.findOne({ _id: req.body.userId, isDeleted: false });
    if (!recipient) return res.status(404).json({ message: "user not found" });
    if (sameId(recipient._id, req.user._id)) return res.status(400).json({ message: "cannot create a direct chat with yourself" });
    let chat = await ChatModel.findOne({ type: "direct", participants: { $all: [req.user._id, recipient._id], $size: 2 } });
    if (!chat) chat = await ChatModel.create({ type: "direct", participants: [req.user._id, recipient._id] });
    return res.status(200).json({ message: "direct chat ready", chat });
  } catch (error) { return next(error); }
};

export const getChat = async (req, res, next) => {
  try {
    const chat = await ChatModel.findById(req.params.id).populate("team", "name image").populate("task", "title status").populate("participants", "name email image");
    if (!chat) return res.status(404).json({ message: "chat not found" });
    if (!(await canAccessChat(chat, req.user._id))) return res.status(403).json({ message: "not allowed to view this chat" });
    return res.status(200).json({ message: "chat fetched", chat });
  } catch (error) { return next(error); }
};

export const listMessages = async (req, res, next) => {
  try {
    const chat = await ChatModel.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "chat not found" });
    if (!(await canAccessChat(chat, req.user._id))) return res.status(403).json({ message: "not allowed to view messages" });
    const { page, limit } = req.query;
    const [messages, total] = await Promise.all([
      MessageModel.find({ chat: chat._id }).populate("sender", "name email image").populate("seenBy", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      MessageModel.countDocuments({ chat: chat._id }),
    ]);
    return res.status(200).json({ message: "messages fetched", messages, total, page, limit });
  } catch (error) { return next(error); }
};

export const sendMessage = async (req, res, next) => {
  try {
    const chat = await ChatModel.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "chat not found" });
    if (!(await canAccessChat(chat, req.user._id))) return res.status(403).json({ message: "not allowed to send messages" });
    const message = await MessageModel.create({ chat: chat._id, sender: req.user._id, text: req.body.text, seenBy: [req.user._id] });
    chat.lastMessage = message._id;
    await chat.save();
    const populated = await message.populate("sender", "name email image");
    emitToRoom(`chat:${chat._id}`, "message:new", { message: populated });
    await createNotifications({ userIds: await recipientsForChat(chat), actorId: req.user._id, message: `New message from ${req.user.name}`, type: "chat", relatedId: chat._id });
    return res.status(201).json({ message: "message sent", data: populated });
  } catch (error) { return next(error); }
};

export const markMessageSeen = async (req, res, next) => {
  try {
    const chat = await ChatModel.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "chat not found" });
    if (!(await canAccessChat(chat, req.user._id))) return res.status(403).json({ message: "not allowed to mark this message" });
    const message = await MessageModel.findOneAndUpdate({ _id: req.params.messageId, chat: chat._id }, { $addToSet: { seenBy: req.user._id } }, { new: true });
    if (!message) return res.status(404).json({ message: "message not found" });
    emitToRoom(`chat:${chat._id}`, "message:seen", { messageId: message._id, userId: req.user._id });
    return res.status(200).json({ message: "message marked as seen", data: message });
  } catch (error) { return next(error); }
};
