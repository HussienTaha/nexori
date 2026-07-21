import { z } from "zod";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
export const taskStatus = z.enum(["todo", "in_progress", "review", "done"]);
export const taskPriority = z.enum(["low", "medium", "high", "urgent"]);

const taskFields = {
  title: z.string().trim().min(2).max(50),
  description: z.string().trim().min(2).max(500).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: z.array(objectId).optional(),
  priority: taskPriority.optional(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
};

export const createTaskSchema = { body: z.object({ ...taskFields, team: objectId.optional() }) };
export const taskIdSchema = { params: z.object({ id: objectId }) };
export const updateTaskSchema = { params: z.object({ id: objectId }), body: z.object(taskFields).partial() };
export const updateTaskStatusSchema = { params: z.object({ id: objectId }), body: z.object({ status: taskStatus }) };
export const addCommentSchema = { params: z.object({ id: objectId }), body: z.object({ text: z.string().trim().min(2).max(500) }) };
export const commentIdSchema = { params: z.object({ id: objectId, commentId: objectId }) };
export const updateCommentSchema = { ...commentIdSchema, body: z.object({ text: z.string().trim().min(2).max(500) }) };
export const attachmentIdSchema = { params: z.object({ id: objectId, attachmentId: objectId }) };
