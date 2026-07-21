import fs from "fs";
import TaskModel from "../../models/task.model.js";
import TeamModel from "../../models/team.model.js";
import UserModel from "../../models/user.model.js";
import cloudinary from "../../service/cloudinary.js";
import { createActivity } from "../../service/activity.js";

const allowedTransitions = {
  todo: ["in_progress"],
  in_progress: ["review", "todo"],
  review: ["done", "in_progress"],
  done: [],
};

const removeTempFile = (filePath) => {
  if (filePath) fs.unlink(filePath, () => {});
};

const sameId = (left, right) => left?.toString() === right?.toString();

const isTeamAdmin = (team, userId) =>
  sameId(team.ownerId, userId) ||
  team.members.some((member) => sameId(member.user, userId) && member.role === "admin");

const canAccessTask = async (task, userId) => {
  if (sameId(task.createdBy, userId) || task.assignedTo.some((id) => sameId(id, userId))) return true;
  if (!task.team) return false;
  const team = await TeamModel.findById(task.team).select("members ownerId");
  return Boolean(team?.members.some((member) => sameId(member.user, userId)) || sameId(team?.ownerId, userId));
};

export const Create_Task = async (req, res, next) => {
  try {
    const { title, description, dueDate, team: teamId, assignedTo = [], priority, tags = [] } = req.body;
    const userId = req.user._id;

    if (teamId) {
      const team = await TeamModel.findById(teamId);
      if (!team) return res.status(404).json({ message: "team not found" });
      if (!isTeamAdmin(team, userId)) return res.status(403).json({ message: "only a team admin can create tasks" });

      const invalidAssignee = assignedTo.some(
        (assignee) => !team.members.some((member) => sameId(member.user, assignee)),
      );
      if (invalidAssignee) return res.status(400).json({ message: "all assignees must belong to the team" });
    }

    const task = await TaskModel.create({
      title,
      description,
      dueDate,
      team: teamId,
      assignedTo,
      priority,
      tags,
      createdBy: userId,
    });

    if (teamId) await TeamModel.findByIdAndUpdate(teamId, { $addToSet: { tasksId: task._id } });
    await createActivity({ team: teamId, task: task._id, user: userId, action: "task_created", metadata: { title } });
    return res.status(201).json({ message: "task created successfully", task });
  } catch (error) {
    return next(error);
  }
};

export const Get_TaskById = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id)
      .populate("team", "name")
      .populate("createdBy", "name email image")
      .populate("assignedTo", "name email image")
      .populate("comments.user", "name email image");
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!(await canAccessTask(task, req.user._id))) return res.status(403).json({ message: "not allowed to view this task" });
    return res.status(200).json({ message: "task fetched", task });
  } catch (error) {
    return next(error);
  }
};

export const Get_Task = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const teams = await TeamModel.find({ "members.user": userId }).select("_id");
    const teamIds = teams.map((team) => team._id);
    const { status, priority, team, assignedTo } = req.query;
    const filter = { $or: [{ createdBy: userId }, { assignedTo: userId }, { team: { $in: teamIds } }] };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (team) filter.team = team;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await TaskModel.find(filter)
      .populate("team", "name")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ message: "tasks fetched", tasks });
  } catch (error) {
    return next(error);
  }
};

export const update_Task = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    const userId = req.user._id;
    if (!sameId(task.createdBy, userId)) return res.status(403).json({ message: "only the creator can update this task" });

    const { title, description, dueDate, assignedTo, priority, tags } = req.body;
    if (assignedTo && task.team) {
      const team = await TeamModel.findById(task.team);
      if (assignedTo.some((id) => !team.members.some((member) => sameId(member.user, id)))) {
        return res.status(400).json({ message: "all assignees must belong to the team" });
      }
    }
    const oldData = { title: task.title, description: task.description, dueDate: task.dueDate, assignedTo: task.assignedTo, priority: task.priority, tags: task.tags };
    for (const [key, value] of Object.entries({ title, description, dueDate, assignedTo, priority, tags })) {
      if (value !== undefined) task[key] = value;
    }
    await task.save();
    await createActivity({ team: task.team, task: task._id, user: userId, action: "task_updated", metadata: { oldData } });
    return res.status(200).json({ message: "task updated", task });
  } catch (error) {
    return next(error);
  }
};

export const update_TaskStatus = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    const userId = req.user._id;
    const isAssigned = task.assignedTo.some((id) => sameId(id, userId));
    let admin = sameId(task.createdBy, userId);
    if (task.team) {
      const team = await TeamModel.findById(task.team);
      admin ||= Boolean(team && isTeamAdmin(team, userId));
    }
    if (!isAssigned && !admin) return res.status(403).json({ message: "not allowed to change this task's status" });
    if (!allowedTransitions[task.status]?.includes(req.body.status)) {
      return res.status(400).json({ message: `invalid status transition from ${task.status} to ${req.body.status}` });
    }
    const oldStatus = task.status;
    task.status = req.body.status;
    await task.save();
    await createActivity({ team: task.team, task: task._id, user: userId, action: "status_changed", metadata: { oldStatus, newStatus: task.status } });
    return res.status(200).json({ message: "status updated", task });
  } catch (error) {
    return next(error);
  }
};

export const delete_Task = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    const team = task.team ? await TeamModel.findById(task.team) : null;
    if (!sameId(task.createdBy, req.user._id) && !(team && isTeamAdmin(team, req.user._id))) {
      return res.status(403).json({ message: "not allowed to delete this task" });
    }
    await TaskModel.findByIdAndDelete(task._id);
    if (task.team) await TeamModel.findByIdAndUpdate(task.team, { $pull: { tasksId: task._id } });
    await createActivity({ team: task.team, task: task._id, user: req.user._id, action: "task_deleted", metadata: { title: task.title } });
    return res.status(200).json({ message: "task deleted" });
  } catch (error) {
    return next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id).populate("comments.user", "name email image");
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!(await canAccessTask(task, req.user._id))) return res.status(403).json({ message: "not allowed to view comments" });
    return res.status(200).json({ message: "comments fetched", comments: task.comments });
  } catch (error) { return next(error); }
};

export const addComment = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!(await canAccessTask(task, req.user._id))) return res.status(403).json({ message: "not allowed to add comments" });
    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    const comment = task.comments.at(-1);
    await createActivity({ team: task.team, task: task._id, user: req.user._id, action: "comment_added", metadata: { comment: comment.text } });
    return res.status(201).json({ message: "comment added", comment });
  } catch (error) { return next(error); }
};

export const updateComment = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "comment not found" });
    if (!sameId(comment.user, req.user._id)) return res.status(403).json({ message: "only the author can update this comment" });
    comment.text = req.body.text;
    await task.save();
    return res.status(200).json({ message: "comment updated", comment });
  } catch (error) { return next(error); }
};

export const deleteComment = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "comment not found" });
    const team = task.team ? await TeamModel.findById(task.team) : null;
    if (!sameId(comment.user, req.user._id) && !(team && isTeamAdmin(team, req.user._id))) return res.status(403).json({ message: "not allowed to delete this comment" });
    comment.deleteOne();
    await task.save();
    return res.status(200).json({ message: "comment deleted" });
  } catch (error) { return next(error); }
};

export const uploadTaskAttachments = async (req, res, next) => {
  const uploaded = [];
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!sameId(task.createdBy, req.user._id)) return res.status(403).json({ message: "only the creator can upload attachments" });
    if (!req.files?.length) return res.status(400).json({ message: "no files uploaded" });
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, { folder: `task-management/tasks/${task._id}`, resource_type: "auto" });
        uploaded.push({ secure_url: result.secure_url, public_id: result.public_id, uploadedBy: req.user._id });
      } finally { removeTempFile(file.path); }
    }
    task.attachments.push(...uploaded);
    await task.save();
    await createActivity({ team: task.team, task: task._id, user: req.user._id, action: "attachment_uploaded", metadata: { files: uploaded.map((file) => file.public_id) } });
    return res.status(201).json({ message: "task attachments uploaded successfully", task });
  } catch (error) {
    await Promise.all(uploaded.map((file) => cloudinary.uploader.destroy(file.public_id)));
    return next(error);
  }
};

export const getTaskAttachments = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!(await canAccessTask(task, req.user._id))) return res.status(403).json({ message: "not allowed to view attachments" });
    return res.status(200).json({ message: "task attachments fetched", attachments: task.attachments });
  } catch (error) { return next(error); }
};

export const deleteTaskAttachment = async (req, res, next) => {
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "task not found" });
    if (!sameId(task.createdBy, req.user._id)) return res.status(403).json({ message: "only the creator can delete attachments" });
    const attachment = task.attachments.find((item) => item.public_id === req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: "attachment not found" });
    await cloudinary.uploader.destroy(attachment.public_id);
    task.attachments.pull(attachment._id);
    await task.save();
    await createActivity({ team: task.team, task: task._id, user: req.user._id, action: "attachment_deleted", metadata: { file: attachment.public_id } });
    return res.status(200).json({ message: "attachment deleted" });
  } catch (error) { return next(error); }
};
