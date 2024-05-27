const express = require("express");
const authRouter = require("./auth/authRoutes");
const propertyRouter = require("./property/propertyRoutes");
const router = express();

router.use("/auth", authRouter);
router.use("/properties", propertyRouter);
module.exports = router;
