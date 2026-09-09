import React from "react";
import { addThousandsSeparator } from "../../utils/helper";

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="et-card flex items-center gap-5 p-5">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px] text-white shadow-[var(--shadow-button)] ${color}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h6 className="mb-1 text-sm font-medium text-ink-muted">
          {label}
        </h6>

        <span className="block text-2xl font-bold tracking-tight text-ink">
          ₹{addThousandsSeparator(value)}
        </span>
      </div>
    </div>
  );
};

export default InfoCard;
