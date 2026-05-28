import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AreaChart = ({ data = [], dataKey = 'value', xAxisKey = 'name', color = '#8b5cf6', height = 240 }) => {
  return (
    <div style={{ width: '100%', height: height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            fillOpacity={1} 
            fill={`url(#color-${dataKey})`} 
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default AreaChart;
