import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const LineChart = ({ data = [], dataKey = 'value', xAxisKey = 'name', color = '#8b5cf6', height = 240 }) => {
  return (
    <div style={{ width: '100%', height: height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            activeDot={{ r: 6 }} 
            dot={{ strokeWidth: 1 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default LineChart;
