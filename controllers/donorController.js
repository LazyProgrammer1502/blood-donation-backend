import Donor from "../models/donor.js";

const calculateRemainingDays = (nextEligibleDate) => {
  if (!nextEligibleDate) return null;
  const today = new Date();
  const diffInMs = new Date(nextEligibleDate) - today;
  const remaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  return remaining > 0 ? remaining : 0;
};

// Add The New Donor
const addDonor = async (req, res) => {
  try {
    const {
      name,
      department_name,
      phone_no,
      reg_no,
      blood_group,
      last_donation_date,
    } = req.body;

    let nextEligibleDate = null;
    if (last_donation_date) {
      const date = new Date(last_donation_date);
      date.setMonth(date.getMonth() + 3);
      nextEligibleDate = date;
    }

    const donor = new Donor({
      name,
      department_name,
      phone_no,
      reg_no,
      blood_group,
      last_donation_date,
      nextEligibleDate,
    });
    await donor.save();
    res.status(201).json({
      message: "Donor Created Successfully",
      donor,
    });
  } catch (error) {
    console.error("Error adding donor:", error.message);
    res
      .status(500)
      .json({ message: "Error adding donor", error: error.message });
  }
};

// Get All Donors
const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    const donorsWithCountdown = donors.map((donor) => ({
      ...donor._doc,
      remainingDays: calculateRemainingDays(donor.nextEligibleDate),
    }));
    res.json(donorsWithCountdown);
  } catch (error) {
    console.error(" Error fetching donors:", error.message);
    res.status(500).json({ message: "Error fetching donors" });
  }
};

// Update Donor
const updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const Updates = req.body;
    if (Updates.last_donation_date) {
      const date = new Date(last_donation_date);
      date.setMonth(date.getMonth() + 3);
      nextEligibleDate = date;
    }

    const donor = await Donor.findByIdAndUpdate(id, Updates, {
      new: true,
      runValidators: true,
    });

    if (!donor) {
      return res.status(404).json({ message: "Donor Not Found" });
    }
    res.json({
      message: "Updated Successfully",
      donor,
    });
  } catch (error) {
    console.error(" Error updating donor:", error.message);
    res
      .status(500)
      .json({ message: "Error updating donor", error: error.message });
  }
};

// Delete Donor
const deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) {
      return res.status(404).json({ message: "Donor Not Found" });
    }
    res.json({ message: "Donor deleted successfully" });
  } catch (error) {
    console.error("Error deleting donor:", error.message);
    res
      .status(500)
      .json({ message: "Error deleting donor", error: error.message });
  }
};

// SEARCH DONOR
const searchDonor = async (req, res) => {
  try {
    let { blood_group, reg_no, department_name } = req.query;
    const filter = {};
    console.log("Raw query:", req.query);
    if (blood_group) {
      let decodedGroup = decodeURIComponent(blood_group.trim());
      if (decodedGroup.endsWith(" "))
        decodedGroup = decodedGroup.replace(" ", "+");
      if (decodedGroup.includes(" "))
        decodedGroup = decodedGroup.replace(/\s/g, "+");
      const escapedGroup = decodedGroup.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.blood_group = { $regex: `^${escapedGroup}$`, $options: "i" };
      console.log("Final decodedGroup:", decodedGroup);
    }
    if (reg_no) {
      filter.reg_no = { $regex: reg_no, $options: "i" };
    }
    if (department_name) {
      filter.department_name = { $regex: department_name, $options: "i" };
    }
    console.log("Final filter:", filter);
    const donors = await Donor.find(filter).sort({ createdAt: -1 });
    const donorsWithCountdown = donors.map((donor) => ({
      ...donor._doc,
      remainingDays: calculateRemainingDays(donor.nextEligibleDate),
    }));
    res.json({
      count: donorsWithCountdown.length,
      donors: donorsWithCountdown,
    });
  } catch (error) {
    console.error(" Error searching donors:", error.message);
    res
      .status(500)
      .json({ message: "Error searching donors", error: error.message });
  }
};

const markAsDonated = async (req, res) => {
  try {
    const { id } = req.params;
    const lastDonationDate = new Date();
    const nextEligibleDate = new Date(lastDonationDate);
    nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);

    const updatedDonor = await Donor.findByIdAndUpdate(
      id,
      {
        last_donation_date: lastDonationDate,
        nextEligibleDate,
        status: "waiting",
      },
      {
        new: true,
      }
    );

    if (!updatedDonor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.json({
      message: "Donor marked as donated successfully",
      donor: updatedDonor,
    });
  } catch (error) {
    console.error(" Error marking donor as donated:", error.message);
    res.status(500).json({
      message: "Error marking donor as donated",
      error: error.message,
    });
  }
};
export {
  addDonor,
  getAllDonors,
  updateDonor,
  deleteDonor,
  searchDonor,
  markAsDonated,
};
