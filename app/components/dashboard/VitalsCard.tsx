import React, { use } from 'react';
import { Thermometer, Activity, Scale, Heart, Ruler, Gauge } from 'lucide-react';
import { VitalParameters } from '@/app/utils/types/clinicalCase';
import { useTranslations } from 'next-intl';

// Interface pour les props de VitalItem
interface VitalItemProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit: string;
  colorClass: string;
}

const VitalItem = ({ icon: Icon, label, value, unit, colorClass }: VitalItemProps) => (
  <div className={`flex items-center p-3 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200 ${colorClass}`}>
    
    {/* 1. L'icône ne doit jamais rétrécir (shrink-0) */}
    <div className="p-2 bg-white rounded-full shadow-sm mr-3 shrink-0">
      <Icon size={18} className="text-gray-600" />
    </div>
    
    {/* 2. Le conteneur de texte doit gérer le dépassement (min-w-0) */}
    <div className="min-w-0 flex-1">
      {/* Label coupé avec '...' si trop long */}
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
        {label}
      </p>
      
      {/* Valeur et unité */}
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-gray-800 leading-none">
          {value}
        </span>
        <span className="text-xs font-normal text-gray-500 truncate">
          {unit}
        </span>
      </div>
    </div>
  </div>
);

export const VitalsCard = ({ vitals }: { vitals: VitalParameters }) => {
  const t = useTranslations('caseDetail');
  const tCommon = useTranslations('dashboard');
  return (
    <div id="vitals-card" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-full">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="text-blue-500" size={18} /> 
        {t('sections.vitals')}
      </h3>
      
      {/* 
         CORRECTION GRILLE : 
         On évite grid-cols-6 qui est trop serré.
         - Mobile : 2 colonnes
         - Tablette/Desktop : 3 colonnes (plus lisible)
      */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        <VitalItem 
          icon={Gauge} 
          label={t('vitals.bloodPressure')} 
          value={vitals.bloodPressure} 
          unit="mmHg" 
          colorClass="bg-blue-50/50" 
        />
        <VitalItem 
          icon={Heart} 
          label={t('vitals.heartRate')} 
          value={vitals.heartRate} 
          unit="bpm" 
          colorClass="bg-red-50/50" 
        />
        <VitalItem 
          icon={Activity} 
          label={t('vitals.pulse')} 
          value={vitals.pulse} 
          unit="bpm" 
          colorClass="bg-rose-50/50" 
        />
        <VitalItem 
          icon={Thermometer} 
          label={t('vitals.temperature')} 
          value={vitals.temperature} 
          unit="°C" 
          colorClass="bg-orange-50/50" 
        />
        <VitalItem 
          icon={Scale} 
          label={t('vitals.weight')} 
          value={vitals.weight} 
          unit="kg" 
          colorClass="bg-emerald-50/50" 
        />
        <VitalItem 
          icon={Ruler} 
          label={t('vitals.height')} 
          value={vitals.height} 
          unit="cm" 
          colorClass="bg-indigo-50/50" 
        />
      </div>
    </div>
  );
};
