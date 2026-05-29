import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BarChart = ({ data = [], dataKey = 'value', xAxisKey = 'name', color = '#a855f7', height = 240 }) => {
  return (
    <div style={{ width: '100%', height: height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E3E8" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="rgba(28, 41, 69, 0.4)" 
            tickLine={false}
            tick={{ fill: '#1C2945', fontSize: 10 }}
          />
          <YAxis 
            stroke="rgba(28, 41, 69, 0.4)" 
            tickLine={false}
            tick={{ fill: '#1C2945', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              borderColor: '#E0E3E8',
              borderRadius: '8px',
              color: '#1C2945',
              fontSize: '11px',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default BarChart;
