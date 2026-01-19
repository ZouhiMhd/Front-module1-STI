// components/dashboard/PatientIdentityCard.tsx
import React from 'react';
import { Briefcase, Calendar, Droplet, UserCircle2 } from 'lucide-react';
import { PatientInfo } from '@/app/utils/types/clinicalCase';
import { useTranslations } from 'next-intl';

export const PatientIdentityCard = ({ patient }: { patient: PatientInfo }) => {
  // const age = new Date().getFullYear() - new Date(patient.year_range).getFullYear();
  const t = useTranslations('caseDetail');
  const tCommon = useTranslations('dashboard');
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-between h-full relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="flex items-start justify-between z-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500 font-bold uppercase tracking-wider">Patient</span>
             <span className="text-xs text-slate-300">ID: {patient.id}</span>
           </div>
           <h2 className="text-2xl font-bold flex items-center gap-2">
             {patient.gender === 'M' ? tCommon('filters.male') : tCommon('filters.female')} 
             {/* <span className="text-slate-400 font-normal text-lg">({age} ans)</span> */}
           </h2>
        </div>
        <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
            <UserCircle2 size={32} className="text-blue-200"/>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 z-10">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Briefcase size={16} /> {patient.job}
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-sm">
           <Droplet size={16} className="text-red-400" /> GS: {patient.bloodGroup}
        </div>
        {/* <div className="flex items-center gap-2 text-slate-300 text-sm col-span-2">
           <Calendar size={16} /> Né(e) le {new Date(patient.birthDate).toLocaleDateString()}
        </div> */}
        <div className="flex items-center gap-2 text-slate-300 text-sm col-span-2">
           <Calendar size={16} /> {tCommon('years')} {t('between')} {patient.yearRange}
        </div>
      </div>
    </div>
  );
};