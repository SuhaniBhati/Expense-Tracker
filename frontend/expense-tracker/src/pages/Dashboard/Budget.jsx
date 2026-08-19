import { useState, useEffect } from "react";

import toast from "react-hot-toast";

import {
  LuTarget,
  LuCalendar,
  LuCircleAlert,
  LuBadgeCheck,
  LuBadgeX,
  LuMinus,
  LuPlus,
} from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";

import axiosInstance from "../../utils/axiosInstance";

import { API_PATHS } from "../../utils/apiPaths";

import { useUserAuth } from "../../hooks/useUserAuth";

import { addThousandsSeparator } from "../../utils/helper";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Budget = () => {
  useUserAuth();

  const now = new Date();

  const [selectedMonth, setSelectedMonth] =
    useState(now.getMonth() + 1);

  const [selectedYear, setSelectedYear] =
    useState(now.getFullYear());

  const [budgetData, setBudgetData] =
    useState(null);

  const [newLimit, setNewLimit] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const fetchBudget = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        API_PATHS.BUDGET.GET_BUDGET,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
        }
      );

      setBudgetData(res.data);

      if (res.data.monthlyLimit > 0) {
        setNewLimit(
          res.data.monthlyLimit.toString()
        );
      } else {
        setNewLimit("");
      }
    } catch (err) {
      toast.error(
        "Failed to load budget data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [selectedMonth, selectedYear]);

  const handleSetBudget = async (e) => {
    e.preventDefault();

    if (
      !newLimit ||
      isNaN(newLimit) ||
      Number(newLimit) <= 0
    ) {
      toast.error(
        "Please enter a valid budget amount"
      );
      return;
    }

    setSaving(true);

    try {
      await axiosInstance.post(
        API_PATHS.BUDGET.SET_BUDGET,
        {
          monthlyLimit: Number(newLimit),
          month: selectedMonth,
          year: selectedYear,
        }
      );

      toast.success(
        "Budget updated successfully!"
      );

      await fetchBudget();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save budget"
      );
    } finally {
      setSaving(false);
    }
  };

  const adjustAmount = (type) => {
    const current =
      parseFloat(newLimit) || 0;

    if (type === "inc") {
      setNewLimit(
        (current + 500).toString()
      );
    }

    if (type === "dec") {
      const updated = Math.max(
        0,
        current - 500
      );

      setNewLimit(updated.toString());
    }
  };

  const years = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  return (
    <DashboardLayout activeMenu="Budget">
      <div className="space-y-6 max-w-3xl mx-auto">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Budget Goals
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan smarter and stay in control of your spending
          </p>
        </div>

        {/* FILTER */}
        <div className="et-card flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
            <LuCalendar className="text-primary text-xl" />
          </div>

          <div className="flex gap-3 w-full flex-wrap">
            <div className="et-input flex-1 m-0">
              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    Number(e.target.value)
                  )
                }
                className="et-select"
              >
                {MONTH_NAMES.map(
                  (month, index) => (
                    <option
                      key={month}
                      value={index + 1}
                    >
                      {month}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="et-input w-[130px] m-0">
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    Number(e.target.value)
                  )
                }
                className="et-select"
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STATUS */}
        {loading ? (
          <div className="et-skeleton h-72 rounded-3xl" />
        ) : (
          <div className="et-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                  <LuTarget className="text-primary text-2xl" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {MONTH_NAMES[selectedMonth - 1]}{" "}
                    {selectedYear}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Monthly budget overview
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {budgetData?.percentage || 0}%
                </p>

                <p className="text-xs text-slate-400">
                  Used
                </p>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mb-6">
              <div className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      budgetData?.percentage || 0,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>₹0</span>

                <span>
                  ₹
                  {addThousandsSeparator(
                    budgetData?.monthlyLimit ||
                      0
                  )}
                </span>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Budget",
                  value:
                    budgetData?.monthlyLimit ||
                    0,
                  bg: "bg-violet-50 dark:bg-violet-500/10",
                  text: "text-primary",
                },
                {
                  label: "Spent",
                  value:
                    budgetData?.totalSpent || 0,
                  bg: "bg-rose-50 dark:bg-rose-500/10",
                  text: "text-rose-500",
                },
                {
                  label: "Remaining",
                  value:
                    budgetData?.remaining || 0,
                  bg: "bg-emerald-50 dark:bg-emerald-500/10",
                  text: "text-emerald-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.bg} rounded-2xl p-5 border border-white/40 dark:border-white/5`}
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {item.label}
                  </p>

                  <p
                    className={`text-xl font-bold ${item.text}`}
                  >
                    ₹
                    {addThousandsSeparator(
                      item.value
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORM */}
        <div className="et-card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
            Set Monthly Budget
          </h3>

          <form
            onSubmit={handleSetBudget}
            className="space-y-5"
          >
            <div>
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Budget Amount
              </label>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    adjustAmount("dec")
                  }
                  className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all"
                >
                  <LuMinus />
                </button>

                <div className="et-input flex-1 m-0">
                  <span className="text-slate-400 text-sm font-medium">
                    ₹
                  </span>

                  <input
                    type="number"
                    value={newLimit}
                    min="0"
                    step="0.01"
                    onChange={(e) =>
                      setNewLimit(
                        e.target.value
                      )
                    }
                    placeholder="Enter budget amount"
                    className="w-full bg-transparent outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    adjustAmount("inc")
                  }
                  className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all"
                >
                  <LuPlus />
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Supports decimals and manual typing
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="et-btn w-full"
            >
              {saving
                ? "Saving..."
                : "Save Budget"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Budget;