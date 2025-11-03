import Donor from "../models/donor.js";

const updateDonorStatus = async (req, res) => {
  try {
    const today = new Date();
    const result = await Donor.updateMany(
      {
        nextEligibleDate: { $lte: today },
        status: "waiting",
      },
      {
        $set: {
          status: "available",
        },
      }
    );
    if (result.modifiedCount > 0) {
      console.log(` ${result.modifiedCount} donors are now available again.`);
    } else {
      console.log(" No donor status updates needed today.");
    }
  } catch (error) {
    console.error(" Error updating donor statuses:", error.message);
  }
};

export { updateDonorStatus };
