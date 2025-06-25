import React, { useContext } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/CurrencyContext';

const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

export type PieChartData = {
  name: string;
  value: number;
  color: string;
};

interface PieChartProps {
  data: PieChartData[];
  loading?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ data, loading = false }) => {
  if (loading || data.length === 0) {
    return (
      <Card className="h-48 flex items-center justify-center">
        <CardContent className="w-full">
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => {
              const { formatCurrency } = useCurrency();
              return [formatCurrency(Number(value)), 'Spent'];
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 mb-1">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-sm font-medium text-gray-200 whitespace-nowrap">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
