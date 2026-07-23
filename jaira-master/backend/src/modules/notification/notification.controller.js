import { Router } from "express";
import { authentication } from "../../middleware/authentaction.js";
import { validation } from "../../middleware/vaildation.js";
import * as service from "./notification.service.js";
import * as schema from "./notification.validation.js";

const notificationRouter = Router();
notificationRouter.get("/", authentication, validation(schema.notificationListSchema), service.listNotifications);
notificationRouter.patch("/read-all", authentication, service.markAllRead);
notificationRouter.patch("/:id/read", authentication, validation(schema.notificationIdSchema), service.markRead);
notificationRouter.delete("/:id", authentication, validation(schema.notificationIdSchema), service.deleteNotification);
export default notificationRouter;
