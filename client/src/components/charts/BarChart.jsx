import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BarChart = ({ data = [], dataKey = 'value', xAxisKey = 'name', color = '#a855f7', height = 240 }) => {
  return (
    <div style={{ width: '100%', height: height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="rgba(255,255,255,0.4)" 
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: '#0f1422',
              borderColor: 'rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#f3f4f6',
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
