import activityModel from "../models/activity.model.js";
import { emitToRoom, emitToUser } from "../sockets/socket.js";

export const createActivity = async ({
  team,

  task,

  user,

  action,

  metadata = {},
}) => {
  const activity = await activityModel.create({
    team,

    task,

    user,

    action,

    metadata,
  });

  const payload = { activity };
  emitToUser(user, "activity:new", payload);
  if (team) emitToRoom(`team:${team}`, "activity:new", payload);
  if (task) emitToRoom(`task:${task}`, "activity:new", payload);
  return activity;
};
