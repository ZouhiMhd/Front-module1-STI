// app/patients/page.tsx
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Activity, FileBarChart, AlertTriangle, 
  CheckCircle2, Loader2 
} from 'lucide-react';

// Types & Services
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { 
  calculateGlobalStats, 
  calculateDemographics, 
  getTopPathologies 
} from '@/services/statsService';

// Composants UI
import { StatCard } from '@/app/components/stats/StatsCard';
import { DemographicsChart } from '@/app/components/stats/DemographicsChart';
import { TopPathologiesList } from '@/app/components/stats/TopPathologiestList';

export default function PatientsStatsPage() {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json'); // Ou votre API
        const data = await response.json();
        setCases(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Calcul des statistiques (Memoized pour la performance)
  const globalStats = useMemo(() => calculateGlobalStats(cases), [cases]);
  const demographics = useMemo(() => calculateDemographics(cases), [cases]);
  const topPathologies = useMemo(() => getTopPathologies(cases), [cases]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mr-2"/> Chargement des statistiques...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 p-8">
      
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileBarChart className="text-blue-600" /> Statistiques Patients
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Vue d'ensemble des données cliniques, taux de validation et pathologies.
        </p>
      </div>

      {/* 1. KPIs (Key Performance Indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Total Dossiers" 
            value={globalStats.totalCases} 
            subtitle="Cas soumis"
            icon={Users} 
            colorClass="bg-blue-50 text-blue-600" 
        />
        <StatCard 
            title="Taux de Validation" 
            value={`${globalStats.validationRate}%`} 
            subtitle={`${globalStats.validatedCount} dossiers validés`}
            icon={CheckCircle2} 
            colorClass="bg-green-50 text-green-600" 
        />
        <StatCard 
            title="Taux de Rejet" 
            value={`${globalStats.rejectionRate}%`} 
            subtitle={`${globalStats.rejectedCount} dossiers rejetés`}
            icon={AlertTriangle} 
            colorClass="bg-red-50 text-red-600" 
        />
        <StatCard 
            title="En Attente" 
            value={globalStats.pendingCount} 
            subtitle="Nécessitent une revue"
            icon={Activity} 
            colorClass="bg-amber-50 text-amber-600" 
        />
      </div>

      {/* 2. Graphiques & Listes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
        
        {/* Colonne Gauche : Démographie */}
        <div className="lg:col-span-1 h-full">
            <DemographicsChart data={demographics} />
        </div>

        {/* Colonne Droite : Pathologies Fréquentes */}
        <div className="lg:col-span-2 h-full">
            <TopPathologiesList items={topPathologies} />
        </div>

      </div>

      {/* 3. Section Supplémentaire (Optionnel : Tableau récapitulatif rapide) */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-4">Derniers cas soumis</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">ID</th>
                        <th className="px-4 py-3">Motif</th>
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 rounded-r-lg">Statut</th>
                    </tr>
                </thead>
                <tbody>
                    {cases.slice(0, 5).map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-slate-700">#{c.id}</td>
                            <td className="px-4 py-3">{c.consultation.reason}</td>
                            <td className="px-4 py-3">{c.patient.gender}, {c.patient.yearRange} ans</td>
                            <td className="px-4 py-3">{new Date(c.submissionDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    c.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 
                                    c.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {c.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}