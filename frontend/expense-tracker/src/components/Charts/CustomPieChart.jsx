

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CATEGORY_COLORS } from "../../utils/helper";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface border border-line rounded-xl p-3 shadow-[var(--shadow-elevated)] text-sm">
        <p className="font-semibold text-ink">{item.name}</p>
        <p style={{ color: item.payload.fill }} className="mt-1">
          ₹{item.value?.toLocaleString("en-IN")}
        </p>
        <p className="text-ink-faint text-xs mt-0.5">
          {item.payload.percent ? `${(item.payload.percent * 100).toFixed(1)}%` : ""}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-ink-faint text-sm">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="amount"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CATEGORY_COLORS[entry.name] || `hsl(${index * 35}, 70%, 55%)`}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;