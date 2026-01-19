"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
    Inbox, Search, Filter, CheckCircle2, XCircle,
    LayoutGrid, User, Activity, Stethoscope, Loader2,
    Microscope, RefreshCw, ChevronLeft, ChevronRight,
    RotateCcw
} from 'lucide-react';

import { useClinicalCases } from '@/app/components/auth/ClinicalCaseContext';
import { useAuth } from '@/app/components/auth/AuthContext';
import {
    filterClinicalCases,
    getCaseStats,
    extractFilterOptions,
    INITIAL_FILTERS,
    CaseFilters,
    ViewMode
} from '@/services/clinicalCaseService';

// --- COMPOSANTS INTERNES ---

const TabButton = ({ label, count, active, onClick, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-5 py-3 border-b-2 transition-all shrink-0 ${
            active ? `border-blue-600 bg-blue-50/50 text-blue-800` : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
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

const CaseGridCard = ({ data, onClick }: { data: any, onClick: () => void }) => {
    const t = useTranslations('caseDetail');
    
    return (
        <div 
            onClick={onClick} 
            className="bg-white p-3.5 my-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
        >
            {/* Barre latérale plus fine */}
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                data.status === 'VALIDATED' ? 'bg-green-500' : 
                data.status === 'DELETED' ? 'bg-red-500' : 'bg-amber-500'
            }`}></div>

            <div className="flex justify-between items-center mb-2.5">
                {/* Icône réduite de h-10 à h-8 */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    data.status === 'VALIDATED' ? 'bg-green-100 text-green-600' : 
                    data.status === 'DELETED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                    <Stethoscope size={16} />
                </div>
                {/* Texte de statut plus petit (text-[9px]) */}
                <span className="px-1.5 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-500">
                    {t(`status.${data.status}`)}
                </span>
            </div>

            <div className="mb-3 flex-center pt-2">
                {/* Spécialité compacte */}
                {/* <div className="flex items-center gap-1.2 text-blue-600 font-bold mb-1 uppercase text-[9px] tracking-tight">
                    <Activity size={10} /> 
                    <span className="truncate">{data.detectedSpecialty?.replace('_', ' ')}</span>
                </div> */}
                {/* Titre réduit à text-sm et interligne serré */}
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    <div className="flex items-center gap-1.2 text-blue-600 font-bold mb-1 uppercase text-sm tracking-tight">
                    <Activity size={10} /> 
                    <span className="truncate">{data.detectedSpecialty?.replace('_', ' ')}</span>
                </div>
                {/* {data.consultation?.reason || "Sans motif"} */}
                </h3>
            </div>

            {/* Footer plus dense */}
            <div className="mt-auto pt-2border-t border-gray-50 flex flex-col gap-1 text-[10px] text-gray-400">
                <div className="flex items-center gap-1.5 text-gray-500">
                    <User size={12} className="shrink-0" /> 
                    <span className="truncate">{data.patient.gender}, {data.patient.yearRange} ans</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>{data.submissionDate ? new Date(data.submissionDate).toLocaleDateString() : '--/--/--'}</span>
                </div>
            </div>
        </div>
    );
};

export default function ClinicalReviewDashboard() {
    const router = useRouter();
    const t = useTranslations('dashboard');
    const { doctor, isLoading: authLoading } = useAuth();
    const { cases: allCases, isLoading: dataLoading, syncWithBackend } = useClinicalCases();

    // États locaux
    const [viewMode, setViewMode] = useState<ViewMode>('ALL');
    const [filters, setFilters] = useState<CaseFilters>(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Filtrage métier (Spécialité médecin)
    const baseCases = useMemo(() => {
        if (!doctor || !allCases) return [];
        return doctor.specialty === 'general_medicine' 
            ? allCases 
            : allCases.filter(c => c.detectedSpecialty === doctor.specialty);
    }, [allCases, doctor]);

    // 2. Application de TOUS les filtres (Tabs + Sidebar) sur le dataset complet
    const filteredResults = useMemo(() => {
        return filterClinicalCases(baseCases, viewMode, filters);
    }, [baseCases, viewMode, filters]);

    // 3. Pagination Front : On découpe le résultat filtré
    const paginatedCases = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredResults.slice(start, start + itemsPerPage);
    }, [filteredResults, currentPage]);

    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    // 4. Stats globales pour les onglets (basées sur baseCases avant filtres sidebar pour cohérence)
    const stats = useMemo(() => getCaseStats(baseCases), [baseCases]);
    const filterOptions = useMemo(() => extractFilterOptions(baseCases), [baseCases]);

    // Reset de la page quand les filtres changent
    useEffect(() => { setCurrentPage(1); }, [viewMode, filters]);

    if (authLoading || (dataLoading && allCases.length === 0)) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="animate-spin mb-4 text-blue-600" size={40} />
                <p className="text-slate-400 animate-pulse">Agrégation des données en cours...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] mt-[64px] bg-slate-50 font-sans text-slate-600 overflow-hidden">
            
            {/* SIDEBAR */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar shadow-sm">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Filter size={20} /></div>
                            {t('filters.title')}
                        </h1>
                        <button onClick={() => setFilters(INITIAL_FILTERS)} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Recherche</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder={t('filters.searchPlaceholder')} 
                                    value={filters.searchQuery} 
                                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })} 
                                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Patient</label>
                            <div className="grid gap-3">
                                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
                                    <option value="ALL">{t('filters.allGenders')}</option>
                                    <option value="M">{t('filters.male')}</option>
                                    <option value="F">{t('filters.female')}</option>
                                </select>
                                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" value={filters.yearRange} onChange={(e) => setFilters({ ...filters, yearRange: e.target.value })}>
                                    <option value="ALL">{t('filters.allAges')}</option>
                                    {filterOptions.yearRanges.map(r => <option key={r} value={r}>{r} {t('years')}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                <header className="bg-white border-b border-gray-200 px-8 pt-6 shrink-0 z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{t('title')}</h2>
                            <p className="text-sm text-slate-400">{t('subtitle')}</p>
                        </div>
                        <button onClick={syncWithBackend} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                            <RefreshCw size={16} className={dataLoading ? "animate-spin" : ""} /> {t('sync')}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            <TabButton icon={LayoutGrid} label={t('tabs.all')} count={stats.total} active={viewMode === 'ALL'} onClick={() => setViewMode('ALL')} />
                            <TabButton icon={Inbox} label={t('tabs.pending')} count={stats.pending} active={viewMode === 'PENDING'} onClick={() => setViewMode('PENDING')} />
                            <TabButton icon={CheckCircle2} label={t('tabs.validated')} count={stats.validated} active={viewMode === 'VALIDATED'} onClick={() => setViewMode('VALIDATED')} />
                            <TabButton icon={XCircle} label={t('tabs.rejected')} count={stats.deleted} active={viewMode === 'DELETED'} onClick={() => setViewMode('DELETED')} />
                        </div>

                        {/* PAGINATION FRONT INTEGRÉE AU HEADER */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-1.5 rounded-xl mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase px-2 tracking-tighter">
                                    Page {currentPage} / {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 rounded-lg hover:bg-white disabled:opacity-20 text-blue-600 transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 rounded-lg hover:bg-white disabled:opacity-20 text-blue-600 transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {paginatedCases.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Inbox size={64} className="mb-4 opacity-10" />
                            <p className="text-lg font-medium">Aucun résultat trouvé</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 pb-10">
                            {paginatedCases.map(c => (
                                <CaseGridCard key={c.id} data={c} onClick={() => router.push(`/dashboard/${c.id}`)} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}