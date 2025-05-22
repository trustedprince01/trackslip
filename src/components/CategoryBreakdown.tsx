
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Food", value: 35, color: "#3b82f6" },
  { name: "Transport", value: 25, color: "#60a5fa" },
  { name: "Shopping", value: 20, color: "#93c5fd" },
  { name: "Bills", value: 15, color: "#bfdbfe" },
  { name: "Other", value: 5, color: "#dbeafe" },
];

export const CategoryBreakdown = () => {
  return (
    <div className="flex flex-row">
      <ResponsiveContainer width="60%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#f3f4f6'
            }}
            formatter={(value) => [`${value}%`, null]}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="w-40 flex flex-col justify-center space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-400">{item.name}</span>
            <span className="text-xs ml-auto font-medium text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
