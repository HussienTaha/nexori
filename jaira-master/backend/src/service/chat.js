import ChatModel from "../models/chat.model.js";

export const createTeamChat = async (team) => {
  const chat = await ChatModel.create({
    type: "team",
    team: team._id,
    participants: team.members.map((member) => member.user),
  });
  return chat;
};

export const createTaskChat = async (task) => ChatModel.create({
  type: "task",
  task: task._id,
  team: task.team,
  participants: [task.createdBy, ...task.assignedTo],
});
