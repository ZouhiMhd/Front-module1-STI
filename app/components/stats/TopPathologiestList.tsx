// app/components/stats/TopPathologiesList.tsx
import { Activity } from 'lucide-react';
import { TopItem } from '@/services/statsService';

export const TopPathologiesList = ({ items }: { items: TopItem[] }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Activity size={20} className="text-emerald-500"/> Motifs Fréquents
      </h3>
      
      <div className="space-y-4">
        {items.map((item, idx) => (
            <div key={idx} className="relative">
                <div className="flex justify-between items-end mb-1 z-10 relative">
                    <span className="text-sm font-medium text-slate-700 truncate pr-4">{item.name}</span>
                    <span className="text-xs font-bold text-slate-500">{item.count} cas</span>
                </div>
                <div className="h-8 w-full bg-gray-50 rounded-lg overflow-hidden relative">
                    <div 
                        className="h-full bg-emerald-100/50 border-r-2 border-emerald-200 absolute top-0 left-0" 
                        style={{ width: `${item.percentage}%` }}
                    ></div>
                    <span className="absolute right-2 top-2 text-[10px] text-emerald-700 font-bold">{item.percentage}%</span>
                </div>
            </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 italic">Aucune donnée disponible.</p>}
      </div>
    </div>
  );
};