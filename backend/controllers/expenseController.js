const xlsx = require("xlsx");
const path = require("path");
const Expense = require("../models/Expense");

// Add Expense
exports.addExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, category, amount, date, description } = req.body;
    if (!category || typeof category !== "string" || !category.trim() || amount === undefined || amount === null || !date) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1000000000) {
      return res.status(400).json({ message: "Amount must be a positive number less than 1,000,000,000" });
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const cleanDescription = typeof description === "string" ? description.slice(0, 500) : "";
    const cleanCategory = category.trim().slice(0, 100);
    const cleanIcon = typeof icon === "string" ? icon.slice(0, 100) : "";

    const newExpense = new Expense({
      userId,
      icon: cleanIcon,
      category: cleanCategory,
      amount: Math.round(numAmount * 100) / 100,
      date: parsedDate,
      description: cleanDescription,
    });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: "Error saving expense", error: error.message });
  }
};

// Get All Expenses
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};

// Download Excel (In-memory streaming)
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    const data = expense.map((item) => ({
      Category: item.category,
      Amount: item.amount,
      Date: new Date(item.date).toISOString().split("T")[0],
      Description: item.description || "",
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expenses");
    
    // Generate XLSX in-memory buffer - no file written to disk
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="expense_details.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Error downloading expense data", error: error.message });
  }
};
