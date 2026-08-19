import React from "react";
import { LuTrendingUp, LuTrendingDown, LuTrash2, LuUtensils } from "react-icons/lu";
import { formatDate, formatCurrency, CATEGORY_COLORS } from "../../utils/helper";

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
  const categoryColor = CATEGORY_COLORS[title] || (isIncome ? "#22c55e" : "#ef4444");

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-all duration-200">
      {/* Icon */}
      <div
        className="w-11 h-11 flex items-center justify-center rounded-xl text-lg flex-shrink-0"
        style={{ backgroundColor: categoryColor + "20", color: categoryColor }}
      >
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : isIncome ? (
          <LuTrendingUp />
        ) : (
          <LuUtensils />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(date)}</p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-sm font-bold ${
            isIncome ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(amount)}
        </span>

        {!hideDeleteBtn && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            title="Delete"
          >
            <LuTrash2 className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionInfoCard;
