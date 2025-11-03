import mongoose from "mongoose";

const patientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone_no: {
      type: String,
      required: true,
    },
    blood_group: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    case_type: {
      type: String,
      required: true,
      trim: true,
    },
    hospital_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
