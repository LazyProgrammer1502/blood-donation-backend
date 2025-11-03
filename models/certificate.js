import mongoose from "mongoose";

const certificateSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const certificate = mongoose.model("certificate", certificateSchema);

export default certificate;
