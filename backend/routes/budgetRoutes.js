const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { setBudget, getBudget } = require("../controllers/budgetController");

const router = express.Router();

router.get("/", protect, getBudget);
router.post("/set", protect, setBudget);

module.exports = router;
