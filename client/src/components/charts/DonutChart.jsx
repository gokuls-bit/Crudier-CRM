import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DonutChart = ({ data = [], height = 240 }) => {
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ec4899'];

  return (
    <div style={{ width: '100%', height: height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15,20,34,0.8)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#0f1422',
              borderColor: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '11px',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconSize={8} 
            iconType="circle"
            wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default DonutChart;
