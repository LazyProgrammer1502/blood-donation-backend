import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, reg_no, password, role } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const verification_code = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!password || !strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }
    const admin = await Admin.create({
      name,
      email,
      reg_no,
      password,
      role,
      verified: false,
      verification_code,
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

    const mailOptions = {
      from: `Blood Society <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Account Verification -- Blood Society",
      html: `
        <div style=" font-family: sans-sarif; line-hight:1.6;">
          <h2>Welcome to Blood Society</h2>
          <p>Hello ${name}</p>
          <p>Your account Password is: ${password}</p>
          <p>
            Your verification code is:
            <strong style="font-size: 18px; color: #e63946;">${verification_code}</strong>
          </p>
          <p>
            Click the button below to verify your account:
            <a href="http://localhost:5173/email/verify" style="background-color:#e63946; color:#fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Verify Account
            </a>
          </p>
          <p>If the button doesn't work, open this link in your browser:</p>
          <p>
            <a href="http://localhost:5173/email/verify">
              http://localhost:5173/email/verify
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({
      message: "Admin created successfully. Verification code sent to email.",
    });
  } catch (error) {
    console.error(" Error registering admin:", error.message);
    res.status(500).json({ message: "Error creating admin" });
  }
};

// verify Admin
const verifyAdmin = async (req, res) => {
  try {
    const { email, code } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.verified) {
      return res.status(400).json({ message: "Already verified" });
    }
    if (admin.verification_code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    await Admin.findOneAndUpdate(
      { email },
      {
        $set: { verified: true },
        $unset: { verification_code: "" },
      }
    );
    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("Error verifying admin:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin.verified) {
      return res
        .status(403)
        .json({ message: "Account not verified. Check your email." });
    }

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Get All Admins Super Admin only
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ _id: { $ne: req.admin._id } }).select(
      "-password"
    );
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

// Update admins super Admin Only
const updateAdmin = async (req, res) => {
  try {
    const { name, email, reg_no, role } = req.body;
    const { id } = req.params;

    // Find admin first
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.reg_no = reg_no || admin.reg_no;
    admin.role = role || admin.role;

    await admin.save();

    res.status(200).json({
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Failed to update admin" });
  }
};

// delete admin super admin only
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};

// search by req_no and email superAdmin only
const searchAdmin = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Please provide a search query" });
    }
    const admin = await Admin.findOne({
      $or: [
        { reg_no: { $regex: new RegExp(`^${query}$`, "i") } },
        { email: { $regex: new RegExp(`^${query}$`, "i") } },
      ],
    }).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error searching admin:", error);
    res.status(500).json({ message: "Failed to search admin" });
  }
};

// change Admin password Super Admin only
const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!newPassword || !strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const salt = await bcrypt.genSalt(10);

    const hashed = await bcrypt.hash(newPassword, salt);
    await Admin.findByIdAndUpdate(id, {
      password: hashed,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `Blood Society <${process.env.EMAIL_USER}`,
      to: admin.email,
      subject: "Your Blood Society Admin Password Was Changed",
      html: `
       <div style="font-family: sans-sarif; ling-hight: 1.6;">
       <h2 style="color: #e63946;">Password Changed Successfully</h2>
       <p>Hello <strong>${admin.name}</strong>,</p>
       <P>Your account password was recently changed by the super admin.</p>
       <p><strong>New Password:</strong>${newPassword}</p>
       </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "Admin password updated and email sent successfully" });
  } catch (error) {
    console.error("Error updating admin password:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

export {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
  searchAdmin,
  verifyAdmin,
  updateAdminPassword,
};
