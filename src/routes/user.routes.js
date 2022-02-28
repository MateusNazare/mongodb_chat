import { Router } from "express";
import UserController from "../controller/UserController.js";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";

const userRoutes = Router();

const userController = new UserController();

userRoutes.post("/auth", userController.authenticate);

userRoutes.post("/", userController.create);
userRoutes.get("/", ensureAuthenticated, userController.getOne);
userRoutes.delete("/", ensureAuthenticated, userController.delete);
userRoutes.patch("/", ensureAuthenticated, userController.update);

export { userRoutes };
