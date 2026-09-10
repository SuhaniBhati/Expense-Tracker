const xlsx = require("xlsx");
const path = require("path");
const Income = require("../models/Income");

// Add Income Source
exports.addIncome = async (req, res) => {
  const userId = req.user.id;
  try {
    const { icon, source, amount, date, description } = req.body;
    if (!source || typeof source !== "string" || !source.trim() || amount === undefined || amount === null || !date) {
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
    const cleanSource = source.trim().slice(0, 100);
    const cleanIcon = typeof icon === "string" ? icon.slice(0, 100) : "";

    const newIncome = new Income({
      userId,
      icon: cleanIcon,
      source: cleanSource,
      amount: Math.round(numAmount * 100) / 100,
      date: parsedDate,
      description: cleanDescription,
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

// Download Excel (In-memory streaming)
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const income = await Income.find({ userId }).sort({ date: -1 });
    const data = income.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: new Date(item.date).toISOString().split("T")[0],
      Description: item.description || "",
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Income");
    
    // Generate XLSX in-memory buffer - no file written to disk
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="income_details.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Error downloading income data", error: error.message });
  }
};
