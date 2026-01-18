"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Inbox, Search, Filter, CheckCircle2, XCircle,
    LayoutGrid, User, Activity, Stethoscope, Loader2,
    Microscope,
} from 'lucide-react';
import { useClinicalCases } from '@/app/components/auth/ClinicalCaseContext'; // Ajuste le chemin
// Types & Services
import { ClinicalCase } from '@/app/utils/types/clinicalCase';
import { useAuth } from '@/app/components/auth/AuthContext';
// import { classifyClinicalCase } from '@/lib/classification/classifier';
import {
    filterClinicalCases,
    getCaseStats,
    extractFilterOptions,
    INITIAL_FILTERS,
    CaseFilters,
    ViewMode
} from '@/services/clinicalCaseService';

// Extension locale du type
type ClassifiedClinicalCase = ClinicalCase & {
    detectedSpecialty: string;
};



// --- COMPOSANT : CARTE DE CAS (GRILLE) ---
const CaseGridCard = ({ data, onClick }: { data: ClassifiedClinicalCase, onClick: () => void }) => (
    <div
        onClick={onClick}
        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
    >
        {/* Barre de couleur latérale selon statut */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${data.status === 'VALIDATED' ? 'bg-green-500' :
            data.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
            }`}></div>

        <div className="flex justify-between items-start mb-3 pl-2">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${data.status === 'VALIDATED' ? 'bg-green-100 text-green-600' :
                    data.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    <Stethoscope size={20} />
                </div>
                <div>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${data.status === 'VALIDATED' ? 'bg-green-50 text-green-700' :
                        data.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                        {data.status === 'PENDING' ? 'En attente' : data.status === 'VALIDATED' ? 'Validé' : 'Rejeté'}
                    </span>
                    {/* <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Briefcase size={16} /> {data.patient.job}
                    </p> */}
                </div>
            </div>
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors pl-2">
            {data.consultation.reason}
        </h3>

        <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-500 pl-2">
            <div className="flex items-center gap-1.5">
                <User size={14} className="text-gray-400" />
                {data.patient.gender === 'M' ? 'Homme' : 'Femme'}, {data.patient.yearRange} ans
            </div>
            {data.detectedSpecialty && (
                <div className="flex items-center gap-1.5">
                    <Activity size={14} className="text-gray-400" />
                    <span className="truncate font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {data.detectedSpecialty}
                    </span>
                </div>
            )}
        </div>
    </div>
);

// --- COMPOSANT : BOUTON ONGLET (KPI) ---
const TabButton = ({ label, count, active, onClick, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`
      flex items-center gap-3 px-5 py-3 rounded-t-lg border-b-2 transition-all min-w-[140px]
      ${active
                ? `border-blue-600 bg-blue-50/50 text-blue-800`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
    `}
    >
        <div className={`p-1.5 rounded-md ${active ? 'bg-white shadow-sm text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
            <Icon size={18} />
        </div>
        <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
            <p className="text-xl font-bold leading-none">{count}</p>
        </div>
    </button>
);

// --- PAGE PRINCIPALE ---

export default function ClinicalReviewDashboard() {
    const router = useRouter();
    const { doctor, isLoading: authLoading } = useAuth();
    // const { cases, isLoading, error } = useClinicalCases(); 
    // Data State
    // const [cases, setCases] = useState<ClassifiedClinicalCase[]>([]);

    // 1. On récupère les données directement du Contexte (plus de fetch local)
    const { cases: allCases, isLoading: dataLoading, error } = useClinicalCases();

    // Filters State
    const [viewMode, setViewMode] = useState<ViewMode>('ALL');
    const [filters, setFilters] = useState<CaseFilters>(INITIAL_FILTERS);

    // --- CHARGEMENT DES DONNÉES ---
    // useEffect(() => {
    //     const loadData = async () => {
    //         if (authLoading) return;
    //         try {
    //             const response = await fetch('/data.json');
    //             const rawData: ClinicalCase[] = await response.json();

    //             // Classification et Filtrage par spécialité du médecin connecté
    //             const classifiedData = rawData.map((c) => ({
    //                 ...c,
    //                 detectedSpecialty: classifyClinicalCase(c)
    //             }));

    //             let filteredBySpecialty = classifiedData;
    //             if (doctor && doctor.specialty && doctor.specialty.toLowerCase() !== 'general_medicine') {
    //                 const expertSpec = doctor.specialty.toLowerCase();
    //                 filteredBySpecialty = classifiedData.filter((c) => c.detectedSpecialty === expertSpec);
    //             }

    //             setCases(filteredBySpecialty);
    //         } catch (e) {
    //             console.error(e);
    //         } finally {
    //             setIsLoadingData(false);
    //         }
    //     };
    //     loadData();
    // }, [doctor, authLoading]);

    // 2. Filtrage initial par spécialité du médecin (remplace le useEffect de chargement)
    const casesToDisplay = useMemo(() => {
        if (!doctor || !allCases) return [];

        // Si médecin généraliste, il voit tout
        if (doctor.specialty === 'general_medicine') {
            return allCases;
        }

        // Sinon, filtre par spécialité détectée
        return allCases.filter(c => c.detectedSpecialty === doctor.specialty);
    }, [allCases, doctor]);

    // --- DONNÉES CALCULÉES (Memo) ---
    const stats = useMemo(() => getCaseStats(casesToDisplay), [casesToDisplay]);
    const filterOptions = useMemo(() => extractFilterOptions(casesToDisplay), [casesToDisplay]);

    // Utilisation du service de filtrage
    const filteredCases = useMemo(() =>
        filterClinicalCases(casesToDisplay, viewMode, filters),
        [casesToDisplay, viewMode, filters]);

    // --- NAVIGATION ---
    const handleCardClick = (id: string) => {
        router.push(`/dashboard/${id}`);
    };

    // --- RENDU : LOADING ---
    if (dataLoading || authLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Chargement des dossiers...
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-600 overflow-hidden">

            {/* =================================================================================
          1. SIDEBAR GAUCHE : FILTRES
      ================================================================================= */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm h-full overflow-y-auto shrink-0">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Filter size={20} /></div>
                        Filtres
                    </h1>

                    <div className="space-y-5">
                        {/* Recherche */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Recherche</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text" placeholder="Symptôme, motif..."
                                    value={filters.searchQuery} onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Démographie */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Patient</label>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-600"
                                    value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                                >
                                    <option value="ALL">Tous genres</option>
                                    <option value="M">Homme</option>
                                    <option value="F">Femme</option>
                                </select>
                                {/* Dans app/dashboard/page.tsx */}

                                {/* ... select Genre ... */}

                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-600"
                                    value={filters.yearRange}
                                    onChange={(e) => setFilters({ ...filters, yearRange: e.target.value })}
                                >
                                    <option value="ALL">Tout âge</option>
                                    <option value="0-5">0-5 ans</option>
                                    {/* Génération dynamique de 6-10 jusqu'à 76-80 */}
                                    {[...Array(15)].map((_, i) => {
                                        const start = 6 + (i * 5);
                                        const end = start + 4;
                                        const label = `${start}-${end}`;
                                        return (
                                            <option key={label} value={label}>
                                                {label} ans
                                            </option>
                                        );
                                    })}
                                    <option value="81+">81+ ans</option>
                                </select>
                            </div>
                        </div>

                        {/* Clinique */}
                        {/* Dans app/dashboard/page.tsx, à l'intérieur de la Sidebar */}

                        {/* Clinique */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Clinique</label>
                            <div className="space-y-3">

                                {/* Le select des antécédents reste inchangé */}
                                <select
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-600"
                                    value={filters.medicalHistory} onChange={(e) => setFilters({ ...filters, medicalHistory: e.target.value })}
                                >
                                    <option value="ALL">Antécédents (Tous)</option>
                                    {filterOptions.histories.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>

                                {/* --- MODIFICATION ICI --- */}
                                {/* Remplacement du Select par un Input pour la Pathologie/Diagnostic */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Pathologie / Résultat diag..."
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-600 placeholder:text-slate-400"
                                        value={filters.pathology === 'ALL' ? '' : filters.pathology}
                                        onChange={(e) => setFilters({ ...filters, pathology: e.target.value || 'ALL' })}
                                    />
                                    {/* Petit icône optionnel pour indiquer la recherche */}
                                    <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                                        <Microscope size={16} />
                                    </div>
                                </div>
                                {/* --- FIN MODIFICATION --- */}

                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* =================================================================================
          2. ZONE CENTRALE : GRILLE DES CAS
      ================================================================================= */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-full relative overflow-hidden">

                {/* Header Navigation (Tabs) */}
                <div className="bg-white border-b border-gray-200 px-8 pt-6 pb-0 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
                            <p className="text-sm text-slate-400 mt-1">Gérez et validez les cas cliniques soumis.</p>
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                            {filteredCases.length} dossier{filteredCases.length > 1 ? 's' : ''} affiché{filteredCases.length > 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Onglets de navigation */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        <TabButton icon={LayoutGrid} label="Tous" count={stats.total} active={viewMode === 'ALL'} onClick={() => setViewMode('ALL')} />
                        <TabButton icon={Inbox} label="En attente" count={stats.pending} active={viewMode === 'PENDING'} onClick={() => setViewMode('PENDING')} />
                        <TabButton icon={CheckCircle2} label="Validés" count={stats.validated} active={viewMode === 'VALIDATED'} onClick={() => setViewMode('VALIDATED')} />
                        <TabButton icon={XCircle} label="Rejetés" count={stats.rejected} active={viewMode === 'REJECTED'} onClick={() => setViewMode('REJECTED')} />
                    </div>
                </div>

                {/* Grille de Cartes */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {filteredCases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 mt-10">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                <Inbox size={48} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-600">Aucun dossier trouvé</h3>
                            <p className="text-sm">Essayez de modifier vos filtres ou changez d'onglet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                            {filteredCases.map(c => (
                                <CaseGridCard
                                    key={c.id}
                                    data={c}
                                    onClick={() => handleCardClick(c.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}