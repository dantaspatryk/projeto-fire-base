import React, { useState, useEffect } from 'react';
import type { ManagedGame, PayoutSettings } from '../types';

// === ICONS ===
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const TrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
    </svg>
);
const TrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const CpuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// FIX: The component implementation was truncated and incomplete. It has been fully implemented.
// Additionally, `React.FC` was removed to improve type inference and avoid potential issues,
// aligning with best practices seen in other components of this application.
const CooldownTimer = ({ endTime }: { endTime: number }) => {
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, endTime - Date.now()));

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining === 0) {
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.round(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-1.5 text-blue-300">
            <CpuIcon className="w-4 h-4" />
            <span className="text-xs font-bold tabular-nums">{formatTime(timeLeft)}</span>
        </div>
    );
};

interface GameCardProps {
    game: ManagedGame;
    payout?: number;
    onSelect: () => void;
    locked: boolean;
    isChangingSoon?: boolean;
    nextPhase?: 'high' | 'low';
    humanSupportCooldownEnd?: number | null;
    payoutSettings: PayoutSettings;
    generatingGameName: string | null;
    isFavorite: boolean;
    onToggleFavorite: (event: React.MouseEvent) => void;
    hasActiveSignal?: boolean;
    hasRiskAnalysis?: boolean;
}

// FIX: The GameCard component was missing. It has been implemented based on its usage in `App.tsx`.
const GameCard: React.FC<GameCardProps> = ({
    game,
    payout,
    onSelect,
    locked,
    isChangingSoon,
    nextPhase,
    humanSupportCooldownEnd,
    payoutSettings,
    generatingGameName,
    isFavorite,
    onToggleFavorite,
    hasActiveSignal,
    hasRiskAnalysis,
}) => {
    const isThisGameGenerating = generatingGameName === game.name;
    const isAnotherGameGenerating = generatingGameName !== null && !isThisGameGenerating;
    const isLowPayout = payout !== undefined && payout < payoutSettings.highPhaseMin;
    // A game card is disabled if it's locked, inactive, on cooldown, or if ANOTHER game is generating.
    const isDisabled = locked || !game.isActive || (humanSupportCooldownEnd && humanSupportCooldownEnd > Date.now()) || isAnotherGameGenerating;

    const opacityClass = isDisabled && !isThisGameGenerating ? 'opacity-50' : 'opacity-100';


    const borderColorClass = locked
        ? 'border-gray-700'
        : isThisGameGenerating
        ? 'border-purple-500 animate-pulse'
        : hasActiveSignal
        ? 'border-purple-500'
        : hasRiskAnalysis
        ? 'border-yellow-500'
        : (!game.isActive || (humanSupportCooldownEnd && humanSupportCooldownEnd > Date.now()))
        ? 'border-gray-700'
        : isChangingSoon
        ? (nextPhase === 'low' ? 'border-red-500 animate-pulse' : 'border-green-500 animate-pulse')
        : isLowPayout
        ? 'border-red-500'
        : 'border-green-500';

    const payoutColorClass = isLowPayout ? 'text-red-500' : 'text-green-500';

    const renderPayoutInfo = () => {
        if (locked) {
            return null;
        }

        if (isThisGameGenerating) {
            return (
                <div className="flex items-center gap-1.5 text-purple-300">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-300"></div>
                    <span className="text-xs font-bold">Analisando...</span>
                </div>
            );
        }

        if (humanSupportCooldownEnd && humanSupportCooldownEnd > Date.now()) {
            return <CooldownTimer endTime={humanSupportCooldownEnd} />;
        }

        if (payout === undefined) {
            return <span className="text-sm font-bold text-gray-400">--%</span>;
        }

        return (
            <div className={`flex items-center gap-1.5 font-bold ${payoutColorClass}`}>
                {isLowPayout ? <TrendingDownIcon className="w-4 h-4" /> : <TrendingUpIcon className="w-4 h-4" />}
                <span className="text-lg">{payout}%</span>
            </div>
        );
    };

    return (
        <button
            onClick={onSelect}
            disabled={isDisabled}
            className={`w-full flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-300 transform hover:scale-105 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:border-gray-700 ${borderColorClass} ${opacityClass}`}
        >
            <div className="flex items-center gap-4">
                {game.icon}
                <div>
                    <h3 className="text-lg font-bold text-left text-white">{game.name}</h3>
                    {!game.isActive && <p className="text-xs text-left text-red-400 font-semibold">Temporariamente Indisponível</p>}
                    {isChangingSoon && !isDisabled && (
                        <>
                            {nextPhase === 'high' && <p className="text-xs text-left text-green-300 font-semibold">Oportunidade se Aproximando!</p>}
                            {nextPhase === 'low' && <p className="text-xs text-left text-red-300 font-semibold">Baixa Probabilidade Chegando!</p>}
                        </>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {renderPayoutInfo()}
                {!locked && (
                    <button
                        onClick={onToggleFavorite}
                        className="relative z-10 p-2 -m-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                        <StarIcon className={`w-7 h-7 transition-all duration-200 transform ${isFavorite ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-yellow-300'}`} />
                    </button>
                )}
                {locked && <LockIcon className="w-6 h-6 text-gray-400" />}
            </div>
        </button>
    );
};

// FIX: Added a default export for the GameCard component to resolve the import error in App.tsx.
export default GameCard;