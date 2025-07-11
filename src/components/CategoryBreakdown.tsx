
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Food", value: 35, color: "#10b981" },
  { name: "Transport", value: 25, color: "#3b82f6" },
  { name: "Shopping", value: 20, color: "#8b5cf6" },
  { name: "Bills", value: 15, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#6b7280" },
];

export const CategoryBreakdown = () => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Spending by Category</h3>
        </div>
        <button className="text-gray-400 hover:text-white text-sm transition-colors">
          View All
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart Container */}
        <div className="w-full max-w-[180px] mx-auto lg:mx-0">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
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
        </div>
        
        {/* Legend */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-xs lg:text-sm text-gray-300 truncate">{item.name}</span>
                </div>
                <span className="text-xs lg:text-sm font-medium text-white ml-2 flex-shrink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
