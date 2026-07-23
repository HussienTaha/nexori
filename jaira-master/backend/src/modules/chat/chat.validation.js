import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");
export const directChatSchema = { body: z.object({ userId: objectId }) };
export const chatIdSchema = { params: z.object({ id: objectId }) };
export const sendMessageSchema = { params: z.object({ id: objectId }), body: z.object({ text: z.string().trim().min(1).max(4000) }) };
export const messageIdSchema = { params: z.object({ id: objectId, messageId: objectId }) };
export const messagesListSchema = {
  params: z.object({ id: objectId }),
  query: z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(30) }),
};
