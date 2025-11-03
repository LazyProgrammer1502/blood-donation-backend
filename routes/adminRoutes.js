import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  searchAdmin,
  updateAdmin,
  deleteAdmin,
  verifyAdmin,
  updateAdminPassword,
} from "../controllers/adminController.js";
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, superAdminOnly, registerAdmin);
router.post("/verify", verifyAdmin);
router.post("/login", loginAdmin);
router.get("/get", protect, superAdminOnly, getAllAdmins);
router.put("/update/:id", protect, superAdminOnly, updateAdmin);
router.delete("/delete/:id", protect, superAdminOnly, deleteAdmin);
router.get("/search", protect, superAdminOnly, searchAdmin);
router.put("/password/:id", protect, superAdminOnly, updateAdminPassword);

export default router;
