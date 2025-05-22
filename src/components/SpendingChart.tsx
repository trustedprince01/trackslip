
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", amount: 20 },
  { name: "Feb", amount: 35 },
  { name: "Mar", amount: 45 },
  { name: "Apr", amount: 30 },
  { name: "May", amount: 65 },
  { name: "Jun", amount: 40 },
];

export const SpendingChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
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
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            color: '#f3f4f6'
          }}
          labelStyle={{ color: '#f3f4f6' }}
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
