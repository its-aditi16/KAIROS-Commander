import React from 'react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskRanking = ({ ranking }) => {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-kairos-red/10 rounded-lg text-kairos-red">
          <Shield size={20} />
        </div>
        <h3 className="font-semibold text-white tracking-wide">Risk Assessment</h3>
      </div>

      <div className="space-y-5">
        {ranking && ranking.map((item, index) => (
          <div key={item.service} className="relative">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white font-medium">{item.service}</span>
              <span className={item.likelihood > 70 ? "text-kairos-red" : "text-kairos-muted"}>
                {item.likelihood}%
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.likelihood}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  item.likelihood > 80 ? 'bg-kairos-red shadow-[0_0_10px_rgba(255,42,109,0.5)]' :
                  item.likelihood > 50 ? 'bg-kairos-orange' :
                  'bg-kairos-blue'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskRanking;
