import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-kairos-surface border border-white/10 p-2 rounded shadow-xl">
        <p className="text-xs text-kairos-muted mb-1">{payload[0].payload.feature}</p>
        <p className="text-sm font-bold text-kairos-blue">
          Impact: {(payload[0].value * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const ShapChart = ({ data }) => {
  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="feature" 
            type="category" 
            width={80} 
            tick={{ fill: '#94A3B8', fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#FF2A6D' : '#00F0FF'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ShapChart;
