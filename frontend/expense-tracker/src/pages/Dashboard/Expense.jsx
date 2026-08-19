import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuDownload, LuHandCoins, LuTrendingDown } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import TransactionInfoCard from "../../components/Cards/TransactionInfoCard";
import Modal from "../../components/Modal";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomLineChart from "../../components/Charts/CustomLineChart";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useUserAuth } from "../../hooks/useUserAuth";
import { addThousandsSeparator, EXPENSE_CATEGORIES } from "../../utils/helper";

const Expense = () => {
  useUserAuth();

  const [expenseList, setExpenseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
      setExpenseList(res.data || []);
    } catch (err) {
      toast.error("Failed to load expense data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async (data) => {
    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, data);
      toast.success("Expense added successfully!");
      setShowAddModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      toast.success("Expense deleted");
      setExpenseList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  // Stats
  const totalExpense = expenseList.reduce((s, e) => s + e.amount, 0);
  const thisMonth = new Date().getMonth();
  const thisMonthExpense = expenseList
    .filter((e) => new Date(e.date).getMonth() === thisMonth)
    .reduce((s, e) => s + e.amount, 0);

  // Chart data: last 6 months
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const m = d.getMonth();
    const y = d.getFullYear();
    const total = expenseList
      .filter(
        (i) => new Date(i.date).getMonth() === m && new Date(i.date).getFullYear() === y
      )
      .reduce((s, i) => s + i.amount, 0);
    return { month: monthNames[m], amount: total };
  });

  // Category breakdown for pie chart
  const categoryMap = expenseList.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Unique categories for filter
  const categories = ["All", ...new Set(expenseList.map((e) => e.category))];

  // Filtered list
  const filtered = expenseList.filter((item) => {
    const matchCat = filterCategory === "All" || item.category === filterCategory;
    const matchSearch =
      !searchQuery ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Track and manage all your spending
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="et-btn-secondary flex items-center gap-2 text-sm w-auto px-5"
            >
              <LuDownload className="text-base" /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="et-btn flex items-center gap-2 w-auto px-5"
            >
              <LuPlus className="text-base" /> Add Expense
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expenses"
            value={addThousandsSeparator(totalExpense)}
            color="bg-gradient-to-br from-rose-400 to-red-600"
          />
          <InfoCard
            icon={<LuTrendingDown />}
            label="This Month"
            value={addThousandsSeparator(thisMonthExpense)}
            color="bg-gradient-to-br from-orange-400 to-amber-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="et-card">
            <h5 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Spending Trend (Last 6 Months)
            </h5>
            <CustomLineChart data={chartData} dataKey="amount" color="#f43f5e" label="Expense" />
          </div>

          <div className="et-card">
            <h5 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              By Category
            </h5>
            <CustomPieChart data={pieData} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filterCategory === c
                    ? "bg-primary text-white shadow-md shadow-purple-500/20"
                    : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="et-card">
          <h5 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
            All Expenses ({filtered.length})
          </h5>

          {loading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="et-skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-slate-800 mt-2">
              {filtered.map((item) => (
                <TransactionInfoCard
                  key={item._id}
                  title={item.category}
                  icon={item.icon}
                  date={item.date}
                  amount={item.amount}
                  type="expense"
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <LuHandCoins className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {searchQuery || filterCategory !== "All"
                  ? "No results match your filter"
                  : "No expenses added yet. Click 'Add Expense' to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddExpenseForm onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      </Modal>
    </DashboardLayout>
  );
};

export default Expense;