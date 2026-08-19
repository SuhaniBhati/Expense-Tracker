import React from "react";
import { LuArrowRight } from "react-icons/lu";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

const RecentTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className="et-card animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-base font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h5>
        <button className="et-card-sm-btn" onClick={onSeeMore}>
          See All <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-slate-800">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 8).map((item) => (
            <TransactionInfoCard
              key={item._id}
              title={item.type === "expense" ? item.category : item.source}
              icon={item.icon}
              date={item.date}
              amount={item.amount}
              type={item.type}
              hideDeleteBtn
            />
          ))
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            No transactions yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
