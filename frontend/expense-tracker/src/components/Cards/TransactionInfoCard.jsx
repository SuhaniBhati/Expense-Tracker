import React from "react";
import {
  LuTrendingUp,
  LuTrash2,
  LuUtensils,
} from "react-icons/lu";

import {
  formatDate,
  formatCurrency,
  CATEGORY_COLORS,
} from "../../utils/helper";

const TransactionInfoCard = ({
  title,
  icon,
  date,
  amount,
  type,
  hideDeleteBtn,
  onDelete,
}) => {
  const isIncome = type === "income";

  const categoryColor =
    CATEGORY_COLORS[title] ||
    (isIncome ? "#22c55e" : "#ef4444");

  return (
    <div className="group relative flex items-center gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-hover">
      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{
          backgroundColor: `${categoryColor}20`,
          color: categoryColor,
        }}
      >
        {icon ? (
          <img
            src={icon}
            alt={title}
            className="h-6 w-6 object-contain"
          />
        ) : isIncome ? (
          <LuTrendingUp />
        ) : (
          <LuUtensils />
        )}
      </div>

      {/* Information */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-ink-faint">
          {formatDate(date)}
        </p>
      </div>

      {/* Amount and Delete */}
      <div className="flex shrink-0 items-center gap-3">
        <span
          className={`text-sm font-bold ${
            isIncome ? "text-success" : "text-danger"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(amount)}
        </span>

        {!hideDeleteBtn && (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-danger opacity-0 transition-all duration-200 hover:bg-danger-soft group-hover:opacity-100 focus-visible:opacity-100"
            title="Delete"
            aria-label={`Delete ${title}`}
          >
            <LuTrash2 className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionInfoCard;