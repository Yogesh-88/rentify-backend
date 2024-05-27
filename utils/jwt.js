const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { JWT_SECRET } = require("../config/server.config");

function generateToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, options);
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Token is missing or malformed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: "Invalid token" });
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
