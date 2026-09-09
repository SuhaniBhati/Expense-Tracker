
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuDownload, LuWalletMinimal, LuTrendingUp } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import TransactionInfoCard from "../../components/Cards/TransactionInfoCard";
import Modal from "../../components/Modal";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import CustomLineChart from "../../components/Charts/CustomLineChart";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useUserAuth } from "../../hooks/useUserAuth";
import { addThousandsSeparator } from "../../utils/helper";

const Income = () => {
  useUserAuth();

  const [incomeList, setIncomeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("All");

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      setIncomeList(res.data || []);
    } catch (err) {
      toast.error("Failed to load income data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, []);

  const handleAdd = async (data) => {
    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, data);
      toast.success("Income added successfully!");
      setShowAddModal(false);
      fetchIncome();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add income");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      toast.success("Income deleted");
      setIncomeList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      toast.error("Failed to delete income");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download");
    }
  };

  // Stats
  const totalIncome = incomeList.reduce((s, i) => s + i.amount, 0);
  const thisMonth = new Date().getMonth();
  const thisMonthIncome = incomeList
    .filter((i) => new Date(i.date).getMonth() === thisMonth)
    .reduce((s, i) => s + i.amount, 0);

  // Chart data: last 6 months
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - idx));
    const m = d.getMonth();
    const y = d.getFullYear();
    const total = incomeList
      .filter(
        (i) => new Date(i.date).getMonth() === m && new Date(i.date).getFullYear() === y
      )
      .reduce((s, i) => s + i.amount, 0);
    return { month: monthNames[m], amount: total };
  });

  // Unique sources for filter
  const sources = ["All", ...new Set(incomeList.map((i) => i.source))];

  // Filtered list
  const filtered = incomeList.filter((item) => {
    const matchSource = filterSource === "All" || item.source === filterSource;
    const matchSearch =
      !searchQuery ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchSource && matchSearch;
  });

  return (
    <DashboardLayout activeMenu="Income">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Income</h1>
            <p className="text-sm text-ink-muted mt-0.5">
              Track all your income sources
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
              <LuPlus className="text-base" /> Add Income
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandsSeparator(totalIncome)}
            color="bg-gradient-to-br from-emerald-400 to-green-600"
          />
          <InfoCard
            icon={<LuTrendingUp />}
            label="This Month"
            value={addThousandsSeparator(thisMonthIncome)}
            color="bg-gradient-to-br from-violet-400 to-purple-600"
          />
        </div>

        {/* Chart */}
        <div className="et-card">
          <h5 className="text-base font-semibold text-ink mb-4">
            Income Trend (Last 6 Months)
          </h5>
          <CustomLineChart data={chartData} dataKey="amount" color="#22c55e" label="Income" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search income..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-surface text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="flex gap-2 flex-wrap">
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSource(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filterSource === s
                    ? "bg-primary text-white shadow-[var(--shadow-button)]"
                    : "bg-surface text-ink-muted border border-line hover:border-primary hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="et-card">
          <h5 className="text-base font-semibold text-ink mb-2">
            All Income ({filtered.length})
          </h5>

          {loading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="et-skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-line-subtle mt-2">
              {filtered.map((item) => (
                <TransactionInfoCard
                  key={item._id}
                  title={item.source}
                  icon={item.icon}
                  date={item.date}
                  amount={item.amount}
                  type="income"
                  onDelete={() => handleDelete(item._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <LuWalletMinimal className="text-4xl text-ink-faint mx-auto mb-3" />
              <p className="text-ink-faint text-sm">
                {searchQuery || filterSource !== "All"
                  ? "No results match your filter"
                  : "No income added yet. Click 'Add Income' to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddIncomeForm onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      </Modal>
    </DashboardLayout>
  );
};

export default Income;