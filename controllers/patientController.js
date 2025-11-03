import Patient from "../models/patient.js";

const addPatient = async (req, res) => {
  try {
    const {
      name,
      relation,
      blood_group,
      age,
      phone_no,
      gender,
      case_type,
      hospital_name,
    } = req.body;
    const patient = await Patient.create({
      name,
      relation,
      blood_group,
      age,
      phone_no,
      gender,
      case_type,
      hospital_name,
    });
    res.status(201).json({ message: "patient added successfully" }, patient);
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ message: "Failed to add patient" });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching details", error);
  }
};

const deletePatient = async (req, res) => {
  try {
    const deleted = await Patient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting Patient", error);
  }
};

const getPatientByPhone = async (req, res) => {
  try {
    const { phone_no } = req.body;
    const patient = await Patient.findOne({ phone_no });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching patient by phone:", error);
    res.status(500).json({ message: "Failed to fetch patient" });
  }
};

export { getAllPatients, addPatient, deletePatient, getPatientByPhone };
