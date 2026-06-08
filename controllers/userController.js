import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Create staff user
export const createStaff = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      username,
      name,
      password: hashedPassword,
      role: "staff",
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
};

// Get all staff users
export const getStaffUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "staff",
    }).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Update staff user (with hashed password if changed)
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, password, isBlocked } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check username conflict if changing
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    if (name) user.name = name;
    
    // Status update (Block/Unblock)
    if (typeof isBlocked !== 'undefined') user.isBlocked = isBlocked;

    // If password is explicitly changed, hash it
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(id).select("-password");
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// Delete staff user
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Staff deleted successfully", id });
  } catch (error) {
    return res.status(500).json({
      message: "Deletion failed",
      error: error.message,
    });
  }
};