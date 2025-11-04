import express from "express";
import {
  addCertificate,
  getAllCertificates,
  deleteCertificate,
} from "../controllers/certificateController.js";
import { uploadCertificate } from "../middleware/uploadCertificate.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", uploadCertificate.single("image"), addCertificate);
router.get("/", getAllCertificates);
router.delete("/:id", protect, deleteCertificate);

export default router;
