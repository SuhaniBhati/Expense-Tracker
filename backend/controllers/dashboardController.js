const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new Types.ObjectId(userId);

    // ── Totals ──────────────────────────────────────────────────────────────
    const totalIncomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenseAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncome = totalIncomeAgg[0]?.total || 0;
    const totalExpense = totalExpenseAgg[0]?.total || 0;

    // ── Last 60 days income ─────────────────────────────────────────────────
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, t) => sum + t.amount, 0
    );

    // ── Last 30 days expense ────────────────────────────────────────────────
    const last30DaysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });

    const expenseLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, t) => sum + t.amount, 0
    );

    // ── Recent transactions (last 5 each) ───────────────────────────────────
    const recentIncome = await Income.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const recentExpense = await Expense.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const recentTransactions = [
      ...recentIncome.map((t) => ({ ...t, type: "income" })),
      ...recentExpense.map((t) => ({ ...t, type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    // ── Monthly chart data (last 6 months) ──────────────────────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyIncome = await Income.aggregate([
      { $match: { userId: userObjectId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyExpense = await Expense.aggregate([
      { $match: { userId: userObjectId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build a unified month-by-month array
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const inc = monthlyIncome.find((x) => x._id.month === m && x._id.year === y);
      const exp = monthlyExpense.find((x) => x._id.month === m && x._id.year === y);
      monthlyData.push({
        month: monthNames[m - 1],
        income: inc?.total || 0,
        expense: exp?.total || 0,
      });
    }

    // ── Category-wise expense breakdown ─────────────────────────────────────
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      totalBalance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      last30DaysExpense: {
        total: expenseLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      recentTransactions,
      monthlyData,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        name: c._id,
        amount: c.total,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};