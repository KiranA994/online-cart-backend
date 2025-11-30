const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({ message: "Admin dashboard" });
  }
);

router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["admin", "user"]),
  (req, res) => {
    res.json({ message: "User profile data" });
  }
);

module.exports = router;
