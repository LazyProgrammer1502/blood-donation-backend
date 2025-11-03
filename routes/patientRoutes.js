import express from "express";
import {
  getAllPatients,
  addPatient,
  deletePatient,
  getPatientByPhone,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", addPatient);
router.get("/get", protect, getAllPatients);
router.delete("/delete/:id", protect, deletePatient);
router.get("/search/:phone_no", protect, getPatientByPhone);

export default router;
