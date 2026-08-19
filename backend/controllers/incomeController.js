const xlsx = require("xlsx");
const path = require("path");
const Income = require("../models/Income");

// Add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, source, amount, date, description } = req.body;
    if (!source || !amount || !date) {
      return res.status(400).json({ message: "Please fill all the required fields" });
    }
    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }
    const newIncome = new Income({
      userId,
      icon: icon || "",
      source,
      amount: Number(amount),
      date: new Date(date),
      description: description || "",
    });
    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (error) {
    res.status(500).json({ message: "Error saving income", error: error.message });
  }
};

// Get All Income Sources
exports.getAllIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Error fetching income", error: error.message });
  }
};

// Delete Income Source
exports.deleteIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.findOne({ _id: req.params.id, userId });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    await income.deleteOne();
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting income", error: error.message });
  }
};

// Download Excel
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date.toLocaleDateString(),
      Description: item.description || "",
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");
    const filePath = path.join(__dirname, "../uploads/income_details.xlsx");
    xlsx.writeFile(wb, filePath);
    res.download(filePath, "income_details.xlsx", (err) => {
      if (err) {
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error downloading income data", error: error.message });
  }
};
