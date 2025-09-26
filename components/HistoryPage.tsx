

import React, { useState, useMemo } from 'react';
import Header from './Header';
import type { HistorySignal } from '../types';

// === ICONS ===
const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="M12 11h4"/><path d="M12 16h4"/>
        <path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
);
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);
const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);


type FilterType = 'all' | 'finalized' | 'invalid' | 'expired';

const HistoryPage: React.FC<{ history: HistorySignal[]; onReplayGame: (gameName: string) => void; }> = ({ history, onReplayGame }) => {
    const [filter, setFilter] = useState<FilterType>('all');
    
    const signalsForDisplay = useMemo(() => history.filter(s => s.status !== 'valid'), [history]);

    const stats = useMemo(() => {
        const finalizedCount = signalsForDisplay.filter(s => s.status === 'finalized').length;
        const invalidCount = signalsForDisplay.filter(s => s.status === 'invalid').length;
        const totalForAssertiveness = finalizedCount + invalidCount;
        const assertiveness = totalForAssertiveness > 0 ? Math.round((finalizedCount / totalForAssertiveness) * 100) : 0;
        
        const winsByGame = signalsForDisplay
            .filter(s => s.status === 'finalized')
            .reduce((acc, s) => {
                acc[s.gameName] = (acc[s.gameName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const mostProfitableGame = Object.keys(winsByGame).length > 0
            ? Object.entries(winsByGame).reduce((a, b) => a[1] > b[1] ? a : b)[0]
            : 'N/A';

        return {
            signalsToday: signalsForDisplay.length,
            assertiveness,
            mostProfitableGame
        };
    }, [signalsForDisplay]);

    const filteredHistory = useMemo(() => {
        if (filter === 'all') {
            return signalsForDisplay;
        }
        return signalsForDisplay.filter(s => s.status === filter);
    }, [signalsForDisplay, filter]);

    const getStatusStyles = (status: HistorySignal['status']) => {
        switch (status) {
            case 'finalized': return { border: 'border-green-500', text: 'Lucro Confirmado', textColor: 'text-green-300', tagBg: 'bg-green-600/50', tagBorder: 'border-green-500' };
            case 'invalid': return { border: 'border-red-500', text: 'Prejuízo Reportado', textColor: 'text-red-300', tagBg: 'bg-red-600/50', tagBorder: 'border-red-500' };
            case 'expired': return { border: 'border-yellow-500', text: 'Expirado', textColor: 'text-yellow-300', tagBg: 'bg-yellow-600/50', tagBorder: 'border-yellow-500' };
            default: return { border: 'border-gray-600', text: 'Válido', textColor: 'text-gray-300', tagBg: 'bg-gray-600/50', tagBorder: 'border-gray-500' };
        }
    };

    const FilterButton: React.FC<{
        label: string;
        count: number;
        filterType: FilterType;
        activeFilter: FilterType;
        onClick: (filter: FilterType) => void;
        color: string;
    }> = ({ label, count, filterType, activeFilter, onClick, color }) => (
        <button
            onClick={() => onClick(filterType)}
            className={`flex-1 p-2 rounded-lg text-center transition-all duration-200 ${activeFilter === filterType ? `${color} text-black font-bold shadow-lg` : 'bg-gray-800/60 text-white hover:bg-gray-700/80'}`}
        >
            <p className="text-sm">{label}</p>
            <p className="text-xl font-bold">{count}</p>
        </button>
    );

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <Header />
            <p className="text-green-400/80 -mt-6 text-lg mb-6 text-center">
                Dashboard de Performance (Hoje)
            </p>

            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-purple-500/30 mb-8 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-400">SINAIS HOJE</p>
                        <div className="flex items-center justify-center gap-2">
                            <ClipboardListIcon className="w-5 h-5 text-purple-300"/>
                            <p className="text-2xl font-bold text-white">{stats.signalsToday}</p>
                        </div>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-400">ASSERTIVIDADE</p>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-300"/>
                            <p className="text-2xl font-bold text-white">{stats.assertiveness}%</p>
                        </div>
                    </div>
                     <div className="bg-gray-800/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-400">MAIS RENTÁVEL</p>
                        <div className="flex items-center justify-center gap-2">
                             <StarIcon className="w-5 h-5 text-yellow-300"/>
                            <p className="text-base font-bold text-white truncate">{stats.mostProfitableGame}</p>
                        </div>
                    </div>
                </div>
            </div>

             <div className="bg-black/30 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-purple-500/30 mb-8">
                <div className="flex gap-2">
                    <FilterButton label="Todos" count={signalsForDisplay.length} filterType="all" activeFilter={filter} onClick={setFilter} color="bg-purple-400"/>
                    <FilterButton label="Lucro" count={signalsForDisplay.filter(s => s.status === 'finalized').length} filterType="finalized" activeFilter={filter} onClick={setFilter} color="bg-green-400"/>
                    <FilterButton label="Prejuízo" count={signalsForDisplay.filter(s => s.status === 'invalid').length} filterType="invalid" activeFilter={filter} onClick={setFilter} color="bg-red-400"/>
                    <FilterButton label="Expirados" count={signalsForDisplay.filter(s => s.status === 'expired').length} filterType="expired" activeFilter={filter} onClick={setFilter} color="bg-yellow-400"/>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="text-center text-gray-400 bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30">
                    Nenhum sinal encontrado para este filtro.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHistory.map((signal) => {
                        const styles = getStatusStyles(signal.status);
                        return (
                            <div key={signal.generatedAtTimestamp} className={`bg-black/30 backdrop-blur-sm rounded-2xl shadow-lg border ${styles.border} overflow-hidden`}>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white text-lg">{signal.gameName}</p>
                                            <p className="text-sm text-gray-400">Gerado às {signal.generatedAt}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${styles.tagBg} ${styles.tagBorder} ${styles.textColor}`}>{styles.text}</span>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                         {signal.attempts.map((attempt, idx) => (
                                            <div key={idx} className="bg-gray-800/60 rounded-lg p-2 flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-300">Entrada {idx + 1}:</span>
                                                    <span className="font-bold text-white">{attempt.type}</span>
                                                </div>
                                                <span className="font-bold text-green-400">{attempt.rounds}x</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                         <button 
                                            onClick={() => onReplayGame(signal.gameName)}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600/50 hover:bg-blue-600/70 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                        >
                                            <PlayIcon className="w-5 h-5" />
                                            Jogar Novamente
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;