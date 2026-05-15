import React, { useRef, useEffect } from 'react';
import { TrendData } from '../../types';

interface TrendChartProps {
  data: TrendData;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div className="p-4 rounded-[16px] border bg-white" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Tren Karir Terkini</h3>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)] mt-0.5">{data.major}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.items.map((item, idx) => (
          <div key={idx} className="group relative">
            <div className="flex items-center justify-between mb-1.5 text-[13px]">
              <span className="font-medium text-gray-700">{item.role}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--accent)]">{item.growth}</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden bg-gray-100">
              <div className="h-full rounded-full transition-all duration-700 bg-[var(--accent)]" style={{ width: `${item.demandScore}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;