const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

// Set or update monthly budget
exports.setBudget = async (req, res) => {
  const userId = req.user.id;
  try {
    const { monthlyLimit, month, year } = req.body;
    if (!monthlyLimit || !month || !year) {
      return res.status(400).json({ message: "monthlyLimit, month and year are required" });
    }
    if (isNaN(monthlyLimit) || Number(monthlyLimit) <= 0) {
      return res.status(400).json({ message: "Monthly limit must be a positive number" });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId, month, year },
      { monthlyLimit: Number(monthlyLimit) },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Error setting budget", error: error.message });
  }
};

// Get budget + current spending for a given month/year
exports.getBudget = async (req, res) => {
  const userId = req.user.id;
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const budget = await Budget.findOne({ userId, month, year });

    // Calculate spending for that month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spendingAgg = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalSpent = spendingAgg[0]?.total || 0;
    const monthlyLimit = budget?.monthlyLimit || 0;
    const remaining = Math.max(0, monthlyLimit - totalSpent);
    const percentage = monthlyLimit > 0 ? Math.min(100, (totalSpent / monthlyLimit) * 100) : 0;

    res.json({
      monthlyLimit,
      totalSpent,
      remaining,
      percentage: Math.round(percentage),
      month,
      year,
      isExceeded: totalSpent > monthlyLimit && monthlyLimit > 0,
      isWarning: percentage >= 80 && percentage < 100,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget", error: error.message });
  }
};
