import React, { useState } from "react";
import { LuX, LuChevronDown } from "react-icons/lu";
import Input from "../Inputs/Input";
import { INCOME_SOURCES } from "../../utils/helper";

const AddIncomeForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.source ||
      !form.amount ||
      !form.date
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      isNaN(form.amount) ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Amount must be a positive number."
      );
      return;
    }

    setError("");

    onAdd({
      ...form,
      amount: Number(form.amount),
    });
  };

  return (
    <div className="p-6 sm:p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Income
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add a new income transaction
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
          >
            <LuX size={18} />
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-1"
      >
        <div>
          <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Income Source *
          </label>

          <div className="et-input relative">
            <select
              value={form.source}
              onChange={handleChange("source")}
              className="et-select pr-8"
            >
              <option value="">
                Select income source
              </option>

              {INCOME_SOURCES.map((s) => (
                <option
                  key={s}
                  value={s}
                >
                  {s}
                </option>
              ))}
            </select>

            <LuChevronDown className="absolute right-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <Input
          label="Amount (₹) *"
          type="number"
          placeholder="e.g. 50000"
          value={form.amount}
          onChange={handleChange("amount")}
        />

        <Input
          label="Date *"
          type="date"
          value={form.date}
          onChange={handleChange("date")}
        />

        <Input
          label="Description (optional)"
          type="text"
          placeholder="e.g. Monthly salary"
          value={form.description}
          onChange={handleChange("description")}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mt-2">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="et-btn mt-4 w-full"
        >
          Add Income
        </button>
      </form>
    </div>
  );
};

export default AddIncomeForm;