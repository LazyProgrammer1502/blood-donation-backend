import Certificate from "../models/certificate.js";
import fs from "fs";
import path from "path";

const addCertificate = async (req, res) => {
  try {
    const { name, event, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Certificate image required" });
    }
    const imagePath = `uploads/certificates/${req.file.filename}`;

    const newCertificate = new Certificate({
      name,
      event,
      date,
      image: imagePath,
    });

    await newCertificate.save();
    res.status(201).json({ message: "certificate added successfully" });
  } catch (error) {
    console.error("Error adding certificate:", error);
    res.status(500).json({ message: "Failed to add certificate" });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    const filePath = path.join(process.cwd(), certificate.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await certificate.deleteOne();
    res.status(200).json({ message: "certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ message: "Failed to delete certificate" });
  }
};

export { addCertificate, getAllCertificates, deleteCertificate };
