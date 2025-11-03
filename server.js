import express from "express";
import cors from "cors";
import connectDb from "./config/db.js";
import dotenv from "dotenv";
import donorRoutes from "./routes/donorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import * as cron from "node-cron";
import { updateDonorStatus } from "./utils/updateDonorStatus.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDb();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Kust");
});
app.use("/api/donors", donorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/uploads", express.static(path.join("uploads")));
app.use("/api/events", eventRoutes);
app.use("/api/certificates", certificateRoutes);

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily donor status update...");
  await updateDonorStatus();
});

app.listen(PORT, () => {
  console.log("server is running", PORT);
});
