"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle2, XCircle, RotateCcw, 
  FileText, History, Pill, Microscope, 
  AlertCircle, Loader2, Activity,
  BrainCircuit, Calendar, User, ClipboardList,
  Sticker, FileSignature,
  Trash2,
  AlertOctagon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// IMPORT DU NOUVEAU CONTEXTE
import { useCaseDetail } from '@/app/components/auth/CaseDetailContext';

// Composants UI
import { VitalsCard } from '@/app/components/dashboard/VitalsCard'; 
import { PatientIdentityCard } from '@/app/components/dashboard/PatientIdentityCard';

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams(); 
  const t = useTranslations('caseDetail');
  const tCommon = useTranslations('dashboard');
  const caseId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Utilisation du contexte dédié au détail
  const { 
    activeCase: caseData, // On renomme pour garder votre logique d'affichage
    isLoading, 
    error, 
    fetchCaseDetail, 
    validateActiveCase, 
    rejectActiveCase,
    restoreActiveCase,
    clearActiveCase
  } = useCaseDetail();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // --- CHARGEMENT ---
  useEffect(() => {
    if (caseId) {
      fetchCaseDetail(caseId);
    }
    // Nettoyage quand on quitte la page
    return () => {
      clearActiveCase();
    };
  }, [caseId, fetchCaseDetail, clearActiveCase]);

  // --- ACTIONS ---
  const handleValidate = async () => {
    if (!caseData) return;
    
    // On propose le diagnostic actuel par défaut, ou l'utilisateur peut le changer
    const currentDiag = caseData.diagnostic.diagnostic_final || "Asthme bronchique"; // Valeur par défaut ou vide
    const confirmedDiag = prompt("Confirmer le diagnostic final :", currentDiag);

    if (confirmedDiag === null) return; // Annulation

    setIsActionLoading(true);
    try {
        // On passe la spécialité ET le diagnostic final
        await validateActiveCase(caseData.detectedSpecialty || "general_medicine", confirmedDiag);
    } catch (e) { 
        alert("Erreur lors de la validation."); 
    } finally { 
        setIsActionLoading(false); 
    }
  };

  const handleRejectConfirm = async () => {
    if (!caseData) return;
    if (!rejectionReason.trim()) {
        alert("Veuillez saisir un motif de rejet.");
        return;
    }

    setIsActionLoading(true);
    try {
        await rejectActiveCase(rejectionReason);
        setRejectModalOpen(false);
    } catch (e) { 
        alert("Erreur lors du rejet."); 
    } finally { 
        setIsActionLoading(false); 
    }
  };

  const handleRestore = async () => {
      if (!caseData) return;
      if (!confirm("Voulez-vous restaurer ce cas en 'En attente' ?")) return;
      
      setIsActionLoading(true);
      try {
          await restoreActiveCase();
      } catch (e) {
          alert("Erreur lors de la restauration.");
      } finally {
          setIsActionLoading(false);
      }
  };
  const getStatusLabel = (status: string) => {
      // Mappe 'PENDING' -> t('status.PENDING')
      return t(`status.${status}`);
  };

  // --- RENDU ---
  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500"/></div>;
  
  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-slate-100 rounded hover:bg-slate-200">{t('back')}</button>
    </div>
  );

  if (!caseData) return null; // Rien à afficher tant que pas chargé
   const isDeleted = caseData.status === 'DELETED';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 pb-20">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} title={t('back')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={24}/></button>
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800">{tCommon('case')} #{caseData.id.slice(0, 8)}...</h1>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        caseData.status === 'VALIDATED' ? 'bg-green-100 text-green-700' : 
                        isDeleted ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {getStatusLabel(caseData.status)}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {t('createdOn')} {new Date(caseData.submissionDate).toLocaleDateString()}</span>
                </div>
            </div>
         </div>
         
         <div className="flex gap-3 w-full md:w-auto justify-end">
            {caseData.status === 'PENDING' && (
                <>
                   <button 
                        onClick={() => setRejectModalOpen(true)} 
                        disabled={isActionLoading} 
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <XCircle size={18}/>{t('actions.reject')}
                    </button>
                    <button 
                        onClick={handleValidate} 
                        disabled={isActionLoading} 
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
                    >
                        {isActionLoading ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>} 
                        {t('actions.validate')}
                    </button>
                </>
            )}
            {caseData.status === 'VALIDATED' && (
                 <button onClick={() => setRejectModalOpen(true)} disabled={isActionLoading} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    <Trash2 size={16}/> {t('actions.reject')}
                 </button>
            )}
            {caseData.status === 'DELETED' && (
                <button onClick={handleRestore} disabled={isActionLoading} className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium">
                    {isActionLoading ? <Loader2 size={16} className="animate-spin"/> : <RotateCcw size={16}/>} {t('actions.restore')}
                 </button>
            )}
         </div>
      </header>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {(caseData.status === 'DELETED') && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2 shadow-sm">
                <div className="p-2 bg-white rounded-full border border-red-100 shadow-sm shrink-0">
                    <AlertOctagon className="text-red-600" size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-red-900 text-base mb-1">{tCommon('case')} {t('status.DELETED')}</h4>
                    <div className="text-sm text-red-700">
                        <span className="font-semibold">{t('rejectionReason')} : </span>
                        {/* Affiche le motif ou un texte par défaut */}
                        {caseData.rejectionReason ? (
                            <span className="italic">« {caseData.rejectionReason} »</span>
                        ) : (
                            <span className="italic text-red-400">Aucun motif spécifié.</span>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* 1. INFO PATIENT & VITAUX */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 h-full flex flex-col gap-4">
                <PatientIdentityCard patient={caseData.patient} />
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm">
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><User size={14}/> {t('sections.administrative')}</h4>
                    <div className="space-y-2 text-slate-600">
                        <div className="flex justify-between"><span>{t('civilStatus')}:</span> <span className="font-medium">{caseData.patient.civilStatus}</span></div>
                        <div className="flex justify-between"><span>{t('condition')}:</span> <span className="font-medium text-amber-600">{caseData.patient.condition}</span></div>
                        <div className="flex justify-between"><span>{t('medicalService')}:</span> <span className="font-medium">{caseData.patient.medicalService}</span></div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 h-full"><VitalsCard vitals={caseData.patient.vitals} /></div>
        </section>

        {/* 2. CONSULTATION & ENRICHISSEMENT IA */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <FileText className="text-blue-500" size={20}/> {t('sections.consultation')}
                </h3>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase">{t('labels.reason')}</span>
                    <p className="text-lg font-medium text-slate-800 mt-1">{caseData.consultation.reason}</p>
                    <div className="mt-2 flex gap-2">
                        <span className="text-xs bg-white px-2 py-1 rounded border text-slate-500">Type: {caseData.consultation.type}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded border text-slate-500">Statut: {caseData.consultation.status}</span>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><FileSignature size={16}/> {t('labels.notes')}</h4>
                <div className="space-y-3">
                    {caseData.consultation.notes.length > 0 ? caseData.consultation.notes.map((note, i) => (
                        <div key={i} className="p-4 border-l-4 border-blue-400 bg-blue-50/30 rounded-r-lg">
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.contenu}</p>
                            <div className="mt-2 flex justify-between text-xs text-slate-400">
                                <span>{note.type}</span>
                                <span>{new Date(note.date).toLocaleString()}</span>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-400 italic">{t('labels.noNotes')}</p>}
                </div>
            </div>

            <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-900">
                    <BrainCircuit className="text-indigo-600" size={20}/> {t('sections.aiAnalysis')}
                </h3>

                <div className="mb-6">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">{t('labels.symptoms')}</h4>
                    <div className="space-y-2">
                        {caseData.consultation.symptoms.map((sym, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm text-sm">
                                <div className="flex justify-between font-medium text-indigo-900">
                                    <span>{sym.location}</span>
                                    {sym.intensity > 0 && <span className="bg-indigo-100 px-1.5 rounded text-xs">Int: {sym.intensity}</span>}
                                </div>
                                <div className="mt-1 text-xs text-slate-500 grid grid-cols-1 gap-1">
                                    {sym.frequency && <p>{t('labels.frequency')}: {sym.frequency}</p>}
                                    {sym.duration && <p>{t('labels.duration')}: {sym.duration}</p>}
                                    {sym.triggerActivity && <p>{t('labels.triggerActivity')}: {sym.triggerActivity}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">{t('labels.suspected')}</h4>
                    <div className="space-y-2">
                        {caseData.consultation.suspectedDisease.map((dis, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border-l-4 border-purple-500 shadow-sm text-sm">
                                <p className="font-bold text-slate-800">{dis.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{dis.observation}</p>
                            </div>
                        ))}
                        {caseData.consultation.suspectedDisease.length === 0 && <p className="text-xs text-slate-400 italic">{t('labels.noSuggestions')}</p>}
                    </div>
                </div>
            </div>
        </section>

        {/* 3. HISTORIQUE MÉDICAL */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                <History className="text-teal-500" size={20}/> {t('sections.history')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2"><AlertCircle size={14}/> {t('labels.allergies')}</h4>
                    <div className="flex flex-wrap gap-2">
                        {caseData.history.allergies.length > 0 ? caseData.history.allergies.map((a, i) => (
                            <span key={i} className="px-2 py-1 bg-white text-red-700 rounded-full border border-red-200 text-xs font-medium shadow-sm">
                                {a.name}
                            </span>
                        )) : <span className="text-sm text-slate-400 italic">{t('labels.none')}</span>}
                    </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2"><Activity size={14}/> {t('labels.chronic')}</h4>
                    <ul className="space-y-2">
                        {caseData.history.chronicDiseases.length > 0 ? caseData.history.chronicDiseases.map((d, i) => (
                            <li key={i} className="text-sm text-slate-700 bg-white p-2 rounded border border-blue-100">
                                <span className="font-medium">{d.name}</span>
                                {d.treatments && <div className="text-xs text-slate-400 mt-0.5">{t('sections.treatment')}: {d.treatments}</div>}
                            </li>
                        )) : <span className="text-sm text-slate-400 italic">{t('labels.none')}</span>}
                    </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2"><ClipboardList size={14}/> {t('labels.otherHistory')}</h4>
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{t('labels.surgeries')}</span>
                            <ul className="mt-1 list-disc list-inside text-slate-600">
                                {caseData.history.surgeries.length > 0 ? caseData.history.surgeries.map((s, i) => (
                                    <li key={i}>{s.name} <span className="text-xs text-slate-400">({s.date})</span></li>
                                )) : <li className="italic text-slate-400 list-none">{t('labels.none')}</li>}
                            </ul>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{t('labels.family')}</span>
                            <ul className="mt-1 list-disc list-inside text-slate-600">
                                {caseData.history.familyHistory.length > 0 ? caseData.history.familyHistory.map((f, i) => (
                                    <li key={i}>{f}</li>
                                )) : <li className="italic text-slate-400 list-none">{t('labels.none')}</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. DIAGNOSTIC & PRISE EN CHARGE */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Microscope className="text-purple-500" size={20}/> {t('labels.examen')}
                </h3>
                
                <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t('labels.physicalDiagnosis')}</h4>
                    {caseData.consultation.physicalDiagnosis.length > 0 ? (
                        <div className="space-y-2">
                            {caseData.consultation.physicalDiagnosis.map((diag, i) => (
                                <div key={i} className="p-3 bg-purple-50/30 rounded-lg border border-purple-100 text-sm">
                                   <p className="font-medium text-purple-900">
                        {typeof diag.result === 'object' 
                            ? JSON.stringify(diag.result) 
                            : diag.result}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(diag.date).toLocaleDateString()}</p>
                                </div> 
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 italic">{t('labels.none')}</p>}
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t('labels.complementaryExams')}</h4>
                    {caseData.exams.length > 0 ? (
                        <div className="space-y-2">
                            {caseData.exams.map((ex, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm text-sm">
                                    <span className="font-bold text-slate-700">{ex.examName}</span>
                                    <span className="text-slate-600">{ex.result}</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-slate-400 italic">{t('labels.none')}</p>}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Pill className="text-emerald-500" size={20}/> {t('sections.treatment')}
                </h3>

                <div className="flex-1 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{t('labels.prescribedTreatments')}</h4>
                        {caseData.treatments.length > 0 ? (
                            <ul className="space-y-2">
                                {caseData.treatments.map((t, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
                                        <div className="text-sm">
                                            <span className="font-bold text-slate-800">{t.drugName}</span>
                                            <span className="text-slate-500 mx-1">-</span>
                                            <span className="text-slate-600">{t.quantity} ({t.duration})</span>
                                            <p className="text-xs text-emerald-600 mt-0.5 italic">{t.instruction}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-400 italic">{t('labels.none')}</p>}
                    </div>

                    <div className="mt-auto p-4 bg-slate-800 text-white rounded-xl shadow-lg">
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">{t('labels.finalDiagnosis')}</h4>
                        <p className="text-xl font-bold">{caseData.diagnostic.diagnostic_final || t('labels.pendingConclusion')}</p>
                        {caseData.diagnostic.lifeMode && (
                            <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-300">
                                <span className="font-bold text-slate-400 block text-xs uppercase mb-1">{t('labels.lifestyleAndAdvice')}</span>
                                {caseData.diagnostic.lifeMode}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Modal Rejet */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('rejectionReason')}</h3>
              <textarea 
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500/20 outline-none resize-none text-sm"
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('reject_modal_description')}
                  autoFocus
              />
              <div className="flex justify-end gap-3">
                  <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm">{t('actions.cancel')}</button>
                  <button onClick={handleRejectConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-lg shadow-red-200">
                      {caseData.status === 'VALIDATED' ? t('actions.invalidate') : t('actions.reject')}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}