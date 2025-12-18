"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import {
  Search, Inbox, ChevronRight, Stethoscope,
  FileText, History, CheckCircle2, XCircle,
  Microscope, Pill, Loader2, ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/app/components/auth/AuthContext';
import { classifyClinicalCase } from '@/lib/classification/classifier';
import { VitalsCard } from '@/app/components/dashboard/VitalsCard';
import { PatientIdentityCard } from '@/app/components/dashboard/PatientIdentityCard';

// Extension locale du type pour l'affichage uniquement
// Cela permet de stocker le résultat de la classification sans modifier le type de base
type ClassifiedClinicalCase = ClinicalCase & {
    detectedSpecialty: string;
};

const CaseListItem = ({ data, active, onClick }: { data: ClassifiedClinicalCase, active: boolean, onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`group flex items-start gap-4 p-4 border-b border-gray-50 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 ${active ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
  >
    <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-blue-600 text-white shadow-blue-200 shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm'}`}>
      <Stethoscope size={18} />
    </div>
    <div className="flex-1 min-w-0">
       <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-bold truncate ${active ? 'text-blue-900' : 'text-gray-700'}`}>
             {data.consultation.reason}
          </span>
       </div>
       <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
         {data.patient.gender === 'M' ? 'H' : 'F'} • {new Date().getFullYear() - new Date(data.patient.birthDate).getFullYear()} ans
         {data.detectedSpecialty && (
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[9px] uppercase">
                {data.detectedSpecialty}
            </span>
         )}
       </p>
       <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
              data.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
              data.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
              {data.status}
          </span>
       </div>
    </div>
    {active && <ChevronRight size={16} className="text-blue-600 self-center" />}
  </div>
);

export default function ClinicalReviewDashboard() {
  const { doctor, isLoading: authLoading } = useAuth();
  const [cases, setCases] = useState<ClassifiedClinicalCase[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [filterType, setFilterType] = useState<'SYMPTOM' | 'DISEASE'>('SYMPTOM');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Chargement et Classification des données
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;

      try {
        const response = await fetch('/data.json');
        const rawData: ClinicalCase[] = await response.json();

        // 1. Classification à la volée (Linear Regression Model)
        // On ajoute detectedSpecialty uniquement pour l'état local du composant
        const classifiedData: ClassifiedClinicalCase[] = rawData.map((c) => ({
            ...c,
            detectedSpecialty: classifyClinicalCase(c)
        }));

        // 2. Filtrage intelligent basé sur la spécialité du docteur
        let filteredBySpecialty = classifiedData;

        if (doctor && doctor.specialty) {
            const expertSpec = doctor.specialty.toLowerCase();
            // Si médecin généraliste, il voit tout
            if (expertSpec !== 'general_medicine') {
                filteredBySpecialty = classifiedData.filter((c) => c.detectedSpecialty === expertSpec);
            }
        }

        setCases(filteredBySpecialty);

        // Sélection par défaut
        if (window.innerWidth >= 768 && filteredBySpecialty.length > 0) {
            setSelectedCaseId(filteredBySpecialty[0].id);
        }
      } catch (e) {
          console.error("Erreur chargement données:", e);
      } finally {
          setIsLoadingData(false);
      }
    };

    loadData();
  }, [doctor, authLoading]);

  const activeCase = cases.find(c => c.id === selectedCaseId);

  const filteredCases = useMemo(() => {
    if (!searchQuery) return cases;
    const lowerQuery = searchQuery.toLowerCase();
    return cases.filter(c =>
      filterType === 'SYMPTOM'
        ? c.consultation.reason.toLowerCase().includes(lowerQuery) ||
          c.consultation.symptoms.some(s => s.location.toLowerCase().includes(lowerQuery))
        : c.history.chronicDiseases.some(d => d.name.toLowerCase().includes(lowerQuery))
    );
  }, [cases, searchQuery, filterType]);

  const handleCaseClick = (id: string) => {
      setSelectedCaseId(id);
      setShowMobileDetail(true);
  };

  const handleBackToList = () => {
      setShowMobileDetail(false);
  };

  const updateCaseStatus = (id: string, status: string, reason?: string) => {
    setCases(prev => prev.map(c => c.id === id ? ({ ...c, status: status as ClinicalCase['status'], rejectionReason: reason } as ClassifiedClinicalCase) : c));
  };

  const handleValidate = () => {
      if(activeCase) updateCaseStatus(activeCase.id, 'VALIDATED');
  };

  const handleRejectConfirm = () => {
      if(activeCase) {
          updateCaseStatus(activeCase.id, 'REJECTED', rejectionReason);
          setRejectModalOpen(false);
          setRejectionReason('');
      }
  };

  if (authLoading || isLoadingData) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mr-2"/> Chargement des cas...
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-600 overflow-hidden relative">

      {/* SIDEBAR (LISTE) */}
      <aside className={`
          flex-col bg-white border-r border-gray-200 z-20 shadow-xl shadow-slate-200/50 transition-all
          md:flex md:w-96 md:static
          ${showMobileDetail ? 'hidden' : 'flex w-full absolute inset-0'}
      `}>
        <div className="p-6 border-b border-gray-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Inbox size={20}/></div>
            Revue Clinique
          </h1>
          {doctor && (
              <p className="text-xs text-blue-600 font-semibold mb-4 ml-1">
                  Spécialité : {doctor.specialty}
              </p>
          )}

          <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
             <button onClick={() => setFilterType('SYMPTOM')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === 'SYMPTOM' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Symptômes</button>
             <button onClick={() => setFilterType('DISEASE')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === 'DISEASE' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Pathologies</button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filteredCases.length === 0 ? (
               <div className="p-8 text-center text-gray-400 text-sm">
                   Aucun cas trouvé pour votre spécialité.
               </div>
           ) : (
               filteredCases.map(c => (
                 <CaseListItem
                    key={c.id}
                    data={c}
                    active={selectedCaseId === c.id}
                    onClick={() => handleCaseClick(c.id)}
                />
               ))
           )}
        </div>
      </aside>

      {/* MAIN CONTENT (DETAIL) */}
      <main className={`
          flex-col min-w-0 bg-slate-50/50 h-full w-full
          md:flex md:static
          ${showMobileDetail ? 'flex absolute inset-0 z-30 bg-slate-50' : 'hidden'}
      `}>
        {activeCase ? (
          <>
            {/* Header Flottant */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
               <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div>
                      <h2 className="text-lg font-bold text-slate-800 flex flex-col md:block">
                        <span>Dossier #{activeCase.id}</span>
                      </h2>
                      <p className="text-xs text-slate-400 hidden md:block">Soumis le {activeCase.submissionDate}</p>
                  </div>
               </div>

               {activeCase.status === 'PENDING' ? (
                   <div className="flex items-center gap-3">
                    <button
                        onClick={() => setRejectModalOpen(true)}
                        className="p-2 md:px-4 md:py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors"
                    >
                        <span className="hidden md:flex items-center gap-2">
                            <XCircle size={18} /> Rejeter
                        </span>
                        <span className="md:hidden">
                            <XCircle size={20} />
                        </span>
                    </button>

                    <button
                        onClick={handleValidate}
                        className="p-2 md:px-6 md:py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors"
                    >
                        <span className="hidden md:flex items-center gap-2">
                            <CheckCircle2 size={18} /> Valider
                        </span>
                        <span className="md:hidden">
                            <CheckCircle2 size={20} />
                        </span>
                    </button>
                </div>
               ) : (
                   <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                       activeCase.status === 'VALIDATED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                   }`}>
                       {activeCase.status === 'VALIDATED' ? 'Validé' : 'Rejeté'}
                   </span>
               )}
            </header>

            {/* Corps Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
               <div className="max-w-6xl mx-auto space-y-6">

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                          <PatientIdentityCard patient={activeCase.patient} />
                      </div>
                      <div className="lg:col-span-2">
                          <VitalsCard vitals={activeCase.patient.vitals} />
                      </div>
                  </div>

                  {/* Consultation */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={20}/></div>
                          <h3 className="text-lg font-bold text-slate-800">Consultation</h3>
                      </div>
                      <p className="text-lg font-medium text-slate-800 mb-6">{activeCase.consultation.reason}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                  <AlertCircle size={16} className="text-orange-500"/> Symptômes signalés
                              </h4>
                              <div className="space-y-3">
                                  {activeCase.consultation.symptoms.map((sym, i) => (
                                      <div key={i} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="font-semibold text-slate-700">{sym.location}</span>
                                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sym.intensity > 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                  Intensité {sym.intensity}/10
                                              </span>
                                          </div>
                                          <div className="text-xs text-slate-500 grid grid-cols-2 gap-2">
                                              <span>Fréquence: {sym.frequency}</span>
                                              <span>Déclencheur: {sym.triggerActivity}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                  <Stethoscope size={16} className="text-blue-500"/> Examen Physique
                              </h4>
                              {activeCase.consultation.physicalDiagnosis.length > 0 ? (
                                  <div className="space-y-3">
                                      {activeCase.consultation.physicalDiagnosis.map((diag, i) => (
                                          <div key={i} className="p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                                              <span className="font-semibold text-blue-900 block text-sm">{diag.name}</span>
                                              <span className="text-slate-700 text-sm">{diag.result}</span>
                                          </div>
                                      ))}
                                  </div>
                              ) : <p className="text-sm text-gray-400 italic">Aucune donnée</p>}
                          </div>
                      </div>
                  </div>

                   {/* Antécédents & Traitements */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><History size={20}/></div>
                              <h3 className="text-lg font-bold text-slate-800">Antécédents</h3>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Maladies Chroniques</h5>
                                  <div className="flex flex-wrap gap-2">
                                      {activeCase.history.chronicDiseases.length > 0 ? activeCase.history.chronicDiseases.map((d, i) => (
                                          <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-100">
                                              {d.name}
                                          </span>
                                      )) : <span className="text-sm text-gray-400">Aucun</span>}
                                  </div>
                              </div>
                              <div className="h-px bg-gray-100 w-full"></div>
                              <div>
                                  <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Allergies</h5>
                                  <div className="flex flex-wrap gap-2">
                                      {activeCase.history.allergies.length > 0 ? activeCase.history.allergies.map((a, i) => (
                                          <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100">
                                              {a.name}
                                          </span>
                                      )) : <span className="text-sm text-gray-400">Aucune</span>}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                          <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Pill size={20}/></div>
                              <h3 className="text-lg font-bold text-slate-800">Traitements Prescrits</h3>
                          </div>
                          <ul className="space-y-3">
                               {activeCase.treatments.map((t, i) => (
                                  <li key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></div>
                                      <div>
                                          <p className="font-bold text-slate-700 text-sm">{t.drugName} <span className="font-normal text-slate-500">- {t.quantity}</span></p>
                                          <p className="text-xs text-slate-500">{t.frequency} • {t.duration}</p>
                                          <p className="text-xs text-emerald-600 mt-1 italic">{t.instruction}</p>
                                      </div>
                                  </li>
                               ))}
                          </ul>
                      </div>
                  </div>

                  {/* Examens */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-10">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Microscope size={20}/></div>
                          <h3 className="text-lg font-bold text-slate-800">Examens Complémentaires</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeCase.exams.map((ex, i) => (
                              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-2">
                                      <span className="font-bold text-indigo-900 text-sm">{ex.examName}</span>
                                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-gray-500">{ex.requestDate}</span>
                                  </div>
                                  <p className="text-sm text-slate-700 mb-1"><strong>Résultat:</strong> {ex.result}</p>
                                  <p className="text-xs text-slate-500">Zone: {ex.anatomy}</p>
                              </div>
                          ))}
                      </div>
                  </div>

               </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
             <Inbox size={64} className="mb-4 text-slate-200"/>
             <p className="text-lg font-medium">Sélectionnez un cas clinique</p>
          </div>
        )}
      </main>

      {/* Modal Rejet */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Motif du rejet</h3>
              <textarea
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-200 focus:outline-none"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi ce cas est rejeté..."
              />
              <div className="flex justify-end gap-3">
                  <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                  <button onClick={handleRejectConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Rejeter</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
