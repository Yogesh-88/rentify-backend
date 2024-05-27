const express = require("express");
const authenticateToken = require("../../../middlewares/authMiddleware");
const {
  postProperty,
  getProperties,
  getPropertyDetails,
  updateProperty,
  deleteProperty,
  likeProperty,
  showInterest,
  getSellerProperties,
} = require("../../../controllers/propertyController");

const router = express.Router();

router.post("/", authenticateToken, postProperty);
router.get("/", getProperties);
router.get("/seller", authenticateToken, getSellerProperties);
router.get("/:id", getPropertyDetails);
router.put("/:id", authenticateToken, updateProperty);
router.delete("/:id", authenticateToken, deleteProperty);
router.post("/:id/like", authenticateToken, likeProperty);
router.post("/:id/interested", authenticateToken, showInterest);

module.exports = router;
