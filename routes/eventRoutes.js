import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
} from "../controllers/eventController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.fields([
    { name: "header_image", maxCount: 1 },
    { name: "images", maxCount: 9 },
  ]),
  createEvent
);
router.put("/:id", protect, updateEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.delete("/:id", protect, superAdminOnly, deleteEvent);

export default router;
