import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as customerController from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.get("/me", authMiddleware, customerController.me);
router.post("/logout", authMiddleware, customerController.logout);

export default router;
