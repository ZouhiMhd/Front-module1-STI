// app/components/stats/DemographicsChart.tsx
import React from 'react';
import { User, Users } from 'lucide-react';
import { DemographicStats } from '@/services/statsService';

export const DemographicsChart = ({ data }: { data: DemographicStats }) => {
  const total = data.maleCount + data.femaleCount;
  const malePercent = total ? Math.round((data.maleCount / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Users size={20} className="text-blue-500"/> Démographie
      </h3>

      {/* Genre */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-600">Répartition H/F</span>
            <span className="text-slate-400">{total} patients</span>
        </div>
        <div className="h-4 w-full bg-pink-100 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500" style={{ width: `${malePercent}%` }}></div>
            {/* Le reste est rose (femme) par défaut via le bg-pink-100 */}
        </div>
        <div className="flex justify-between text-xs mt-2 text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Hommes ({malePercent}%)</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-300"></div> Femmes ({100 - malePercent}%)</div>
        </div>
      </div>

      {/* Age Groups */}
      <div>
         <h4 className="text-sm font-bold text-slate-700 mb-3">Tranches d'âge</h4>
         <div className="space-y-3">
            {Object.entries(data.ageGroups).map(([range, count]) => (
                <div key={range}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{range} ans</span>
                        <span className="font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};