import Attendance from "../models/Attendance.js";

// Helper function to extract system hardware specs from user agent header
const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"] || "";
  return {
    ip: req.ip || req.headers["x-forwarded-for"] || "Unknown",
    userAgent: ua,
    browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Other",
    os: ua.includes("Windows") ? "Windows" : ua.includes("Android") ? "Android" : ua.includes("iPhone") ? "iOS" : ua.includes("Mac") ? "MacOS" : "Linux",
    device: ua.includes("Mobile") ? "Mobile" : "Desktop",
  };
};

// @desc    Staff Check-In
// @route   POST /api/attendance/check-in
// @access  Private
export const staffCheckIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Check if check-in entry already exists for today
    const existing = await Attendance.findOne({ staffId: req.user.id, date: today });
    if (existing) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const deviceInfo = getDeviceInfo(req);
    const data = await Attendance.create({
      staffId: req.user.id,
      staffName: req.user.name,
      date: today,
      checkIn: new Date(),
      deviceInfo,
    });

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// @desc    Staff Check-Out
// @route   POST /api/attendance/check-out
// @access  Private
export const staffCheckOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ staffId: req.user.id, date: today });
    if (!attendance) {
      return res.status(404).json({ message: "No check-in record found for today. Please check-in first." });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out for today" });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime - attendance.checkIn;
    const hours = diffMs / (1000 * 60 * 60);

    attendance.checkOut = checkOutTime;
    attendance.totalHours = Number(hours.toFixed(2));
    await attendance.save();

    return res.status(200).json(attendance);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// @desc    Get logged-in employee's history
// @route   GET /api/attendance/my
// @access  Private
export const getMyAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({ staffId: req.user.id }).sort({ date: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Admin view for monitoring all logs with range filters
// @route   GET /api/attendance/all
// @access  Private (Admin Only)
export const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin authorization required." });
    }

    const { from, to, staffId } = req.query;
    let filter = {};

    // Apply strict staff query parsing if defined
    if (staffId && staffId !== "") {
      filter.staffId = staffId;
    }

    // Standard date-string boundary configuration
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    } else if (from) {
      filter.date = { $gte: from };
    } else if (to) {
      filter.date = { $lte: to };
    }

    const data = await Attendance.find(filter).sort({ date: -1 });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};