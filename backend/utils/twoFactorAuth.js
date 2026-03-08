const speakeasy = require("speakeasy");

const generateSecret = () => {
  return speakeasy.generateSecret({ length: 20 });
};

const verifyToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token: String(token || "").trim(),
    window: 1,
  });
};

module.exports = { generateSecret, verifyToken };
