

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-line rounded-xl p-3 shadow-[var(--shadow-elevated)] text-sm">
        <p className="font-semibold text-ink mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="mb-0.5">
            {entry.name}: ₹{entry.value?.toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomBarChart = ({ data }) => {
  const { isDark } = useTheme();

  const gridColor = isDark ? "#1b2233" : "#eef1f6";
  const tickColor = isDark ? "#7c879e" : "#94a3b8";

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-ink-faint text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: tickColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: tickColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill="#22c55e"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="expense"
          name="Expense"
          fill="#f43f5e"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
