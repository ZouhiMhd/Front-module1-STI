"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, RotateCcw, 
  AlertOctagon, FileText, History, Pill, Microscope, 
  AlertCircle, Stethoscope, Loader2 
} from 'lucide-react';

// Types & Services
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { classifyClinicalCase } from '@/lib/classification/classifier';

// --- IMPORT DES COMPOSANTS EXISTANTS ---
import { VitalsCard } from '@/app/components/dashboard/VitalsCard'; 
import { PatientIdentityCard } from '@/app/components/dashboard/PatientIdentityCard';

// Extension locale du type pour l'affichage
type ClassifiedClinicalCase = ClinicalCase & {
    detectedSpecialty: string;
};

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const caseId = params.id as string;

  // États
  const [caseData, setCaseData] = useState<ClassifiedClinicalCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour le Modal de Rejet
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const fetchCase = async () => {
      try {
        // Simulation d'appel API
        const response = await fetch('/data.json');
        if (!response.ok) throw new Error("Erreur réseau");
        
        const allCases: ClinicalCase[] = await response.json();
        const foundCase = allCases.find((c) => c.id === caseId);

        if (!foundCase) {
          setError("Ce cas clinique est introuvable.");
        } else {
          // Classification à la volée
          const classified = {
            ...foundCase,
            detectedSpecialty: classifyClinicalCase(foundCase)
          };
          setCaseData(classified);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le dossier.");
      } finally {
        setIsLoading(false);
      }
    };

    if (caseId) fetchCase();
  }, [caseId]);

  // --- ACTIONS ---
  const handleUpdateStatus = (status: 'VALIDATED' | 'REJECTED' | 'PENDING', reason?: string) => {
    if (!caseData) return;

    // Mise à jour optimiste
    setCaseData(prev => prev ? { ...prev, status, rejectionReason: reason } : null);
    
    // TODO: Appel API réel ici
    
    if (status === 'REJECTED') {
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const handleRestore = () => {
    if (confirm("Voulez-vous restaurer ce cas en 'En attente' ?")) {
      handleUpdateStatus('PENDING', undefined);
    }
  };

  // --- RENDU : LOADING / ERROR ---
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin mb-2 h-8 w-8"/>
        <p>Chargement du dossier {caseId}...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md border border-gray-100">
            <AlertOctagon className="mx-auto h-12 w-12 text-red-400 mb-4"/>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Erreur</h2>
            <p className="text-slate-500 mb-6">{error || "Dossier introuvable"}</p>
            <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Retour au Dashboard
            </button>
        </div>
      </div>
    );
  }

  // --- RENDU : PAGE DÉTAIL ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 pb-10">
      
      {/* HEADER FIXE */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Titre & Retour */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                    onClick={() => router.back()} 
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors group"
                    title="Retour"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        Dossier #{caseData.id}
                        {caseData.detectedSpecialty && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full uppercase font-normal tracking-wider border border-gray-200">
                                {caseData.detectedSpecialty}
                            </span>
                        )}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${caseData.status === 'VALIDATED' ? 'bg-green-500' : caseData.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <p className="text-sm font-medium text-slate-500">
                            Statut: {caseData.status === 'PENDING' ? 'En attente' : caseData.status === 'VALIDATED' ? 'Validé' : 'Rejeté'}
                        </p>
                        <span className="text-slate-300 mx-1">•</span>
                        <p className="text-xs text-slate-400">Soumis le {new Date(caseData.submissionDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Barre d'actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {caseData.status === 'PENDING' && (
                    <>
                        <button onClick={() => setRejectModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 transition-colors">
                            <XCircle size={18} /> Rejeter
                        </button>
                        <button onClick={() => handleUpdateStatus('VALIDATED')} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transition-colors">
                            <CheckCircle2 size={18} /> Valider
                        </button>
                    </>
                )}
                {caseData.status === 'VALIDATED' && (
                    <button onClick={() => setRejectModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                        <XCircle size={18} /> Invalider
                    </button>
                )}
                {caseData.status === 'REJECTED' && (
                    <button onClick={handleRestore} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors">
                        <RotateCcw size={18} /> Restaurer
                    </button>
                )}
            </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Alerte si Rejeté */}
        {caseData.status === 'REJECTED' && caseData.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertOctagon className="text-red-500 mt-1 shrink-0" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-red-800">Dossier Rejeté</h4>
                    <p className="text-sm text-red-700 mt-1">{caseData.rejectionReason}</p>
                </div>
            </div>
        )}

        {/* 1. Identité & Vitaux (Utilisation des composants existants) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-full">
                {/* Passage des props au composant existant */}
                <PatientIdentityCard patient={caseData.patient} />
            </div>
            <div className="lg:col-span-2 h-full">
                {/* Passage des props au composant existant */}
                <VitalsCard vitals={caseData.patient.vitals} />
            </div>
        </div>

        {/* 2. Consultation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={20}/></div>
                <h3 className="text-lg font-bold text-slate-800">Consultation</h3>
            </div>
            
            <div className="mb-8 pl-2 border-l-4 border-amber-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Motif principal</p>
                <p className="text-xl font-medium text-slate-800">{caseData.consultation.reason}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Symptômes */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-500"/> Symptômes signalés
                    </h4>
                    <div className="space-y-3">
                        {caseData.consultation.symptoms.map((sym, i) => (
                            <div key={i} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-700">{sym.location}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sym.intensity > 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        Intensité {sym.intensity}/10
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 grid grid-cols-2 gap-y-1">
                                    <span><span className="font-semibold">Fréquence:</span> {sym.frequency}</span>
                                    <span><span className="font-semibold">Déclencheur:</span> {sym.triggerActivity}</span>
                                    <span><span className="font-semibold">Durée:</span> {sym.duration}</span>
                                    <span><span className="font-semibold">Début:</span> {new Date(sym.startDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Examen Physique */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Stethoscope size={16} className="text-blue-500"/> Examen Physique
                    </h4>
                    {caseData.consultation.physicalDiagnosis.length > 0 ? (
                        <div className="space-y-3">
                            {caseData.consultation.physicalDiagnosis.map((diag, i) => (
                                <div key={i} className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                                    <span className="font-bold text-blue-900 block text-sm mb-1">{diag.name}</span>
                                    <span className="text-slate-700 text-sm block">{diag.result}</span>
                                    {diag.observation && <span className="text-xs text-slate-400 mt-2 block italic">Obs: {diag.observation}</span>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-400 italic">Aucune donnée d'examen physique.</p>}
                </div>
            </div>
        </div>

        {/* 3. Antécédents & Traitements */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Histoire */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><History size={20}/></div>
                    <h3 className="text-lg font-bold text-slate-800">Antécédents</h3>
                </div>
                <div className="space-y-6">
                    <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Maladies Chroniques</h5>
                        {caseData.history.chronicDiseases.length > 0 ? (
                            <div className="space-y-2">
                                {caseData.history.chronicDiseases.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                                        <span className="text-sm font-medium text-purple-900">{d.name}</span>
                                        <span className="text-xs text-purple-500">{d.treatments}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <span className="text-sm text-gray-400 italic">Aucun antécédent chronique.</span>}
                    </div>
                    <div className="h-px bg-gray-100 w-full"></div>
                    <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3">Allergies</h5>
                        <div className="flex flex-wrap gap-2">
                            {caseData.history.allergies.length > 0 ? caseData.history.allergies.map((a, i) => (
                                <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100 font-medium">
                                    {a.name}
                                </span>
                            )) : <span className="text-sm text-gray-400 italic">Aucune allergie connue.</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Traitements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Pill size={20}/></div>
                    <h3 className="text-lg font-bold text-slate-800">Traitements Prescrits</h3>
                </div>
                <ul className="space-y-3">
                    {caseData.treatments.map((t, i) => (
                        <li key={i} className="flex items-start gap-4 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                            <div className="mt-1 h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">Rx</div>
                            <div>
                                <p className="font-bold text-slate-700 text-sm">{t.drugName} <span className="font-normal text-slate-500 bg-white px-2 py-0.5 rounded border ml-2 text-xs">{t.quantity}</span></p>
                                <p className="text-xs text-slate-500 mt-1">{t.frequency} • {t.duration}</p>
                                <p className="text-xs text-emerald-600 mt-1 italic font-medium">{t.instruction}</p>
                            </div>
                        </li>
                    ))}
                    {caseData.treatments.length === 0 && <p className="text-sm text-gray-400 italic">Aucun traitement prescrit.</p>}
                </ul>
            </div>
        </div>

        {/* 4. Examens */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Microscope size={20}/></div>
                <h3 className="text-lg font-bold text-slate-800">Examens Complémentaires</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {caseData.exams.map((ex, i) => (
                    <div key={i} className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                            <span className="font-bold text-indigo-900 text-sm">{ex.examName}</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-gray-500">{ex.requestDate}</span>
                        </div>
                        <div className="mt-auto">
                            <p className="text-sm text-slate-700 mb-1"><span className="font-semibold text-slate-500">Résultat:</span> {ex.result}</p>
                            <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">Zone: {ex.anatomy}</p>
                        </div>
                    </div>
                ))}
                {caseData.exams.length === 0 && <p className="text-sm text-gray-400 italic">Aucun examen complémentaire.</p>}
            </div>
        </div>

      </main>

      {/* MODAL DE REJET */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Motif du rejet</h3>
              <p className="text-sm text-slate-500 mb-4">Veuillez indiquer la raison pour laquelle ce cas clinique n'est pas validé.</p>
              <textarea 
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none text-sm"
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Données incohérentes, manque de détails..."
                  autoFocus
              />
              <div className="flex justify-end gap-3">
                  <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm">Annuler</button>
                  <button 
                    onClick={() => handleUpdateStatus('REJECTED', rejectionReason)} 
                    disabled={!rejectionReason.trim()} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                  >
                    Confirmer le Rejet
                  </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}