import React from "react";
import { addThousandsSeparator } from "../../utils/helper";

const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-5 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn">
      <div
        className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-2xl shadow-lg flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{label}</h6>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          ₹{addThousandsSeparator(value)}
        </span>
      </div>
    </div>
  );
};

export default InfoCard;
