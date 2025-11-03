import mongoose from "mongoose";

const donorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department_name: {
    type: String,
    required: true,
  },
  phone_no: {
    type: String,
    required: true,
    unique: true,
  },
  reg_no: {
    type: String,
    required: true,
    unique: true,
  },
  blood_group: {
    type: String,
    required: true,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  last_donation_date: Date,
  nextEligibleDate: Date,
  status: {
    type: String,
    enum: ["available", "waiting"],
    default: "available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donor = mongoose.model("Donor", donorSchema);
export default Donor;
