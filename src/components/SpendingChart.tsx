
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { format } from "date-fns";
import { Receipt } from "@/types/receipt";

interface SpendingChartProps {
  receipts: Receipt[];
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-blue-400">
          ${payload[0].value?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendingChart = ({ receipts }: SpendingChartProps) => {
  // Group receipts by month and calculate total spent each month
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const monthlyTotals = new Array(12).fill(0);
    
    // Initialize all months with 0
    const result = months.map((month, index) => ({
      name: month,
      amount: 0,
      date: new Date(currentYear, index, 1)
    }));
    
    // Calculate totals for each month
    receipts.forEach(receipt => {
      const date = new Date(receipt.date);
      const month = date.getMonth();
      result[month].amount += receipt.total_amount || 0;
    });
    
    return result;
  }, [receipts]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={monthlyData}
        margin={{
          top: 5,
          right: 0,
          left: -35,
          bottom: 0,
        }}
      >
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={{ stroke: '#374151' }}
          tickLine={{ stroke: '#374151' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          content={<CustomTooltip />}
        />
        <Bar 
          dataKey="amount"
          fill="url(#blueGradient)"
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};
