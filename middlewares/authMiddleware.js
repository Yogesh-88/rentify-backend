const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { JWT_SECRET } = require("../config/server.config");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
