import { Router } from "express";
import { authentication } from "../../middleware/authentaction.js";
import { validation } from "../../middleware/vaildation.js";
import * as service from "./chat.service.js";
import * as schema from "./chat.validation.js";

const chatRouter = Router();
chatRouter.get("/", authentication, service.listChats);
chatRouter.post("/direct", authentication, validation(schema.directChatSchema), service.createDirectChat);
chatRouter.get("/:id", authentication, validation(schema.chatIdSchema), service.getChat);
chatRouter.get("/:id/messages", authentication, validation(schema.messagesListSchema), service.listMessages);
chatRouter.post("/:id/messages", authentication, validation(schema.sendMessageSchema), service.sendMessage);
chatRouter.patch("/:id/messages/:messageId/seen", authentication, validation(schema.messageIdSchema), service.markMessageSeen);
export default chatRouter;
