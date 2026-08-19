export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateFullName = (name) => {
  return name.trim().length >= 3;
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.split(" ");
  let initials = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    if (words[i]) initials += words[i][0];
  }
  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num === null || num === undefined) return "0";
  const [integerPart, decimalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

export const formatCurrency = (amount) => {
  return `₹${addThousandsSeparator(Number(amount).toFixed(2))}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Housing",
  "Utilities",
  "Travel",
  "Personal Care",
  "Fitness",
  "Subscriptions",
  "Insurance",
  "Gifts",
  "Other",
];

export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Dividend",
  "Bonus",
  "Gift",
  "Other",
];

export const CATEGORY_COLORS = {
  "Food & Dining": "#f59e0b",
  Shopping: "#3b82f6",
  Transportation: "#10b981",
  Entertainment: "#8b5cf6",
  Healthcare: "#ef4444",
  Education: "#06b6d4",
  Housing: "#f97316",
  Utilities: "#84cc16",
  Travel: "#ec4899",
  "Personal Care": "#a78bfa",
  Fitness: "#14b8a6",
  Subscriptions: "#6366f1",
  Insurance: "#78716c",
  Gifts: "#fb7185",
  Other: "#94a3b8",
  Salary: "#22c55e",
  Freelance: "#0ea5e9",
  Business: "#8b5cf6",
  Investment: "#f59e0b",
  Rental: "#ef4444",
  Dividend: "#10b981",
  Bonus: "#06b6d4",
  Gift: "#ec4899",
};