import React, { useState } from "react";
import {
  LuX,
  LuChevronDown,
} from "react-icons/lu";

import Input from "../Inputs/Input";
import { EXPENSE_CATEGORIES } from "../../utils/helper";

const AddExpenseForm = ({
  onAdd,
  onClose,
}) => {
  const [form, setForm] = useState({
    category: "",
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
      !form.category ||
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">
            Add Expense
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            Add a new expense transaction
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="et-icon-btn shrink-0"
            aria-label="Close expense form"
          >
            <LuX size={18} />
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-1"
      >
        {/* Category */}
        <div>
          <label className="text-[13px] font-medium text-ink-muted">
            Expense Category *
          </label>

          <div className="et-input relative">
            <select
              value={form.category}
              onChange={handleChange("category")}
              className="et-select pr-8"
            >
              <option value="">
                Select expense category
              </option>

              {EXPENSE_CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <LuChevronDown className="pointer-events-none absolute right-4 text-ink-faint" />
          </div>
        </div>

        <Input
          label="Amount (₹) *"
          type="number"
          placeholder="e.g. 1500"
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
          placeholder="e.g. Grocery shopping"
          value={form.description}
          onChange={handleChange("description")}
        />

        {error && (
          <div className="mt-2 rounded-xl border border-danger bg-danger-soft px-4 py-3">
            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="et-btn mt-4 w-full"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;
