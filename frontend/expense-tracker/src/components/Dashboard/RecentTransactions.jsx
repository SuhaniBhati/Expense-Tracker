import React from "react";
import { LuArrowRight } from "react-icons/lu";

import TransactionInfoCard from "../Cards/TransactionInfoCard";

const RecentTransactions = ({
  transactions,
  onSeeMore,
}) => {
  return (
    <div className="et-card animate-fadeIn">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h5 className="text-base font-semibold text-ink">
          Recent Transactions
        </h5>

        <button
          type="button"
          className="et-card-sm-btn shrink-0"
          onClick={onSeeMore}
        >
          See All
          <LuArrowRight className="text-base" />
        </button>
      </div>

      <div className="divide-y divide-line-subtle">
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 8).map((item) => (
            <TransactionInfoCard
              key={item._id}
              title={
                item.type === "expense"
                  ? item.category
                  : item.source
              }
              icon={item.icon}
              date={item.date}
              amount={item.amount}
              type={item.type}
              hideDeleteBtn
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-ink-faint">
            No transactions yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
