import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// Login user
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    // 1. യൂസർ ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുന്നു
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 2. യൂസർ ബ്ലോക്ക്ഡ് ആണോ എന്ന് ചെക്ക് ചെയ്യുന്നു 👇 (പുതിയത്)
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact the admin.",
      });
    }

    // 3. പാസ്‌വേഡ് ശരിയാണോ എന്ന് നോക്കുന്നു
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};