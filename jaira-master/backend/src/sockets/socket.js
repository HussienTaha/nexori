import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import RevokedTokenModel from "../models/revokedtoken.model.js";
import UserModel from "../models/user.model.js";
import TeamModel from "../models/team.model.js";
import TaskModel from "../models/task.model.js";
import ChatModel from "../models/chat.model.js";
import { verifyToken } from "../utlis/token/token.js";

let io;

const sameId = (left, right) => left?.toString() === right?.toString();

const chatAccess = async (chat, userId) => {
  if (chat.type === "direct") {
    return chat.participants.some((participant) => sameId(participant, userId));
  }
  if (chat.team) {
    const team = await TeamModel.findById(chat.team).select("ownerId members");
    return Boolean(
      team &&
      (sameId(team.ownerId, userId) ||
        team.members.some((member) => sameId(member.user, userId))),
    );
  }
  if (chat.task) {
    const task = await TaskModel.findById(chat.task).select(
      "createdBy assignedTo team",
    );
    if (!task) return false;
    if (
      sameId(task.createdBy, userId) ||
      task.assignedTo.some((id) => sameId(id, userId))
    )
      return true;
    if (!task.team) return false;
    const team = await TeamModel.findById(task.team).select("ownerId members");
    return Boolean(
      team &&
      (sameId(team.ownerId, userId) ||
        team.members.some((member) => sameId(member.user, userId))),
    );
  }
  return false;
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN?.split(",").map((origin) =>
        origin.trim(),
      ) || ["http://localhost:3000"],
    },
  });
  io.use(async (socket, next) => {
    try {
      const authorization = socket.handshake.auth?.authorization;

      if (!authorization) {
        return next(new Error("Authorization is required"));
      }

      const [prefix, token] = authorization.split(" ");

      if (!prefix || !token) {
        return next(new Error("Invalid token format"));
      }

      let signature;

      if (prefix === process.env.BERFIX_USER) {
        signature = process.env.SIGNATURE_USER;
      } else if (prefix === process.env.BERFIX_ADMIN) {
        signature = process.env.SIGNATURE_ADMIN;
      } else {
        return next(new Error("Invalid token prefix"));
      }
      
      const decoded = verifyToken({ token, signature });
      
      console.log("Decoded Token:", decoded);
      const revoked = await RevokedTokenModel.exists({
        tokenId: decoded.jti,
      });

      if (revoked) {
        return next(new Error("Token revoked"));
      }

      const user = await UserModel.findById(decoded.userId).select(
        "role confirm status isDeleted",
      );

      if (
        !user ||
        user.isDeleted ||
        !user.confirm ||
        user.status !== "active"
      ) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
      };

      next();
    } catch (err) {
      next(err);
    }
  });
  io.on("connection", (socket) => {

    const userId = socket.data.user.id;
    socket.join(`user:${userId}`);

    socket.on("team:join", async (teamId, acknowledge) => {
      const team = await TeamModel.findById(teamId).select("ownerId members");
      const allowed =
        team &&
        (sameId(team.ownerId, userId) ||
          team.members.some((member) => sameId(member.user, userId)));
      if (!allowed)
        return acknowledge?.({
          ok: false,
          message: "Not allowed to join this team room",
        });
      socket.join(`team:${teamId}`);
      return acknowledge?.({ ok: true });
    });

    socket.on("task:join", async (taskId, acknowledge) => {
      const task = await TaskModel.findById(taskId).select(
        "createdBy assignedTo team",
      );
      if (!task) return acknowledge?.({ ok: false, message: "Task not found" });
      let allowed =
        sameId(task.createdBy, userId) ||
        task.assignedTo.some((id) => sameId(id, userId));
      if (!allowed && task.team) {
        const team = await TeamModel.findById(task.team).select(
          "ownerId members",
        );
        allowed = Boolean(
          team &&
          (sameId(team.ownerId, userId) ||
            team.members.some((member) => sameId(member.user, userId))),
        );
      }
      if (!allowed)
        return acknowledge?.({
          ok: false,
          message: "Not allowed to join this task room",
        });
      socket.join(`task:${taskId}`);
      return acknowledge?.({ ok: true });
    });

    socket.on("chat:join", async (chatId, acknowledge) => {
      const chat = await ChatModel.findById(chatId);
      if (!(chat && (await chatAccess(chat, userId))))
        return acknowledge?.({
          ok: false,
          message: "Not allowed to join this chat",
        });
      socket.join(`chat:${chatId}`);
      return acknowledge?.({ ok: true });
    });

    socket.on("chat:leave", (chatId) => socket.leave(`chat:${chatId}`));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io is not initialized");
  return io;
};

export const emitToUser = (userId, event, payload) =>
  getIO().to(`user:${userId}`).emit(event, payload);
export const emitToRoom = (room, event, payload) =>
  getIO().to(room).emit(event, payload);

export const emitToTask = (taskId, event, payload) =>
  getIO().to(`task:${taskId}`).emit(event, payload);
export const emitToChat = (chatId, event, payload) =>
  getIO().to(`chat:${chatId}`).emit(event, payload);
