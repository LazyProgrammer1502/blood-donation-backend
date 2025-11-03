import express from "express";
const router = express.Router();

import {
  addDonor,
  getAllDonors,
  updateDonor,
  deleteDonor,
  searchDonor,
  markAsDonated,
} from "../controllers/donorController.js";

router.post("/add", addDonor);
router.get("/get", getAllDonors);
router.put("/update/:id", updateDonor);
router.delete("/delete/:id", deleteDonor);
router.get("/search", searchDonor);
router.put("/donated/:id", markAsDonated);

export default router;
