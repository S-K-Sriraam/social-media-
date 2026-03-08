const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { generateSecret, verifyToken } = require("../utils/twoFactorAuth");

exports.signup = async (req, res) => {
  const { email, password, token } = req.body;
  console.log(email, password, token);

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const userExistsEmail = await User.findOne({ email });
    const userExistsUsername = await User.findOne({ username });

    if (userExistsEmail || userExistsUsername) {
      res.status(400).json({ message: "User Already Exists" });
      return false;
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      secret: user.twoFactorAuth,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0];
      return res
        .status(400)
        .json({ message: firstError?.message || error.message });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const fieldName = duplicateField || "field";
      return res.status(400).json({ message: `${fieldName} already exists` });
    }

    return res.status(500).json({ message: error.message || "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select(
      "+password +twoFactorAuthSecret",
    );

    if (user && (await user.matchPassword(password))) {
      const normalizedToken =
        typeof token === "string" ? token.trim() : String(token || "").trim();
      const hasTwoFactorEnabled = Boolean(
        user.twoFactorAuth && user.twoFactorAuthSecret,
      );

      if (hasTwoFactorEnabled) {
        if (!normalizedToken) {
          return res.status(401).json({ message: "2FA token required" });
        }

        if (!verifyToken(user.twoFactorAuthSecret, normalizedToken)) {
          return res.status(401).json({ message: "Invalid 2FA token" });
        }
      }

      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        twoFactorAuth: hasTwoFactorEnabled,
        secret: user.twoFactorAuth,
      });
    }

    return res.status(401).json({ message: "Invalid Credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};

exports.enableTwoFactorAuth = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const secret = generateSecret();
  user.twoFactorAuth = true;
  user.twoFactorAuthSecret = secret.base32;
  await user.save();
  res.json({
    message: "Two-factor authentication is enabled",
    secret: secret.otpauth_url,
  });
};
