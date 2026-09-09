
import React from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-line rounded-xl p-3 shadow-[var(--shadow-elevated)] text-sm">
        <p className="font-semibold text-ink mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            ₹{entry.value?.toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLineChart = ({ data, dataKey = "amount", color = "#875cf5", label = "Amount" }) => {
  const { isDark } = useTheme();

  const gridColor = isDark ? "#1b2233" : "#eef1f6";
  const tickColor = isDark ? "#7c879e" : "#94a3b8";

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-ink-faint text-sm">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: tickColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: tickColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={label}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#gradient-${dataKey})`}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "var(--color-surface)" }}
          activeDot={{ r: 6, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;