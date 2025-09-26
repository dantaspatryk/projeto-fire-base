import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Header from './Header';
import { generateVolatilityAnalysis, generateReWarningAnalysis } from '../services/geminiService';
import { getPredictedProfile } from '../services/strategyService';
import type { GeneratedSignal, VolatilityAnalysis, CustomStrategyConfig, PayoutSettings, HistorySignal, PayoutState } from '../types';

// === COPIED ICONS and COMPONENTS from App.tsx to resolve dependencies ===

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
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
const ZapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
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

const SlidersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);
const SpacemanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 12a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5z"/>
        <path d="M12 12v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-5"/>
    </svg>
);
const BombIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="5"/><path d="m15.5 8.5 2 2"/><path d="M12 6V4"/><path d="m17 15 2 .5"/></svg>);

// New InfoIcon
const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const BarChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

// New InfoModal component to replace Tooltip
const InfoModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-md mx-auto bg-black/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-500/80 text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2" aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <InfoIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
            <p className="text-gray-300 text-base">{content}</p>
        </div>
    </div>
);


// === SignalGeneratorPage component and its helpers, extracted from App.tsx ===
type AppState = 'idle' | 'analyzing_volatility' | 'cooldown' | 're_warned';
type StrategyMode = 'intelligent' | 'manual' | 'predictive';

interface SignalRequestRecord {
    [gameName: string]: number[]; // Array of timestamps
}

interface SignalGeneratorPageProps {
    gameName: string;
    gameIcon: React.ReactElement<any> | null;
    payout?: number;
    payoutState?: PayoutState;
    onBack: () => void;
    signalRequestHistory: SignalRequestRecord;
    setSignalRequestHistory: React.Dispatch<React.SetStateAction<SignalRequestRecord>>;
    onTriggerVolatility: (gameName: string) => void;
    volatilityCooldownEnd: number | null;
    humanSupportCooldownEnd: number | null;
    payoutSettings: PayoutSettings;
    isRevisitAfterWarning?: boolean;
    nextPhaseDurationMinutes?: number;
    isGenerating: boolean;
    generationStartTime?: number;
    generationError: string | null;
    onInitiateSignalGeneration: (gameName: string, options?: { customStrategy?: CustomStrategyConfig; isAnalysisOnly?: boolean; }) => void;
    onClearGenerationError: () => void;
    signalHistory: HistorySignal[];
}

const HumanSupportCooldown: React.FC<{ endTime: number; onBack: () => void; }> = ({ endTime, onBack }) => {
    const [timeLeft, setTimeLeft] = useState(() => Math.max(0, endTime - Date.now()));

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = Math.max(0, endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining === 0) {
                clearInterval(timer);
                // Main App component handles state transition, so this component doesn't need to trigger a change.
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
        <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-blue-500/50 animate-fade-in text-center">
            <CpuIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-300 mb-4">Análise Humanizada em Progresso</h3>
            <p className="text-gray-300 text-base mb-6">Após seu feedback, nossos especialistas iniciaram uma análise aprofundada neste jogo para garantir a qualidade dos próximos sinais. Ele estará disponível novamente em:</p>
            <p className="text-6xl font-bold text-white tabular-nums mb-8">{formatTime(timeLeft)}</p>
            <button
                onClick={onBack}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
                Escolher Outro Jogo
            </button>
        </div>
    );
};

const StrategyBuilder: React.FC<{
    config: CustomStrategyConfig;
    setConfig: React.Dispatch<React.SetStateAction<CustomStrategyConfig>>;
    onGenerate: () => void;
    isLoading: boolean;
}> = ({ config, setConfig, onGenerate, isLoading }) => {

    const handleRoundTypeChange = (type: string) => {
        setConfig(prev => {
            const newTypes = prev.preferredRoundTypes.includes(type)
                ? prev.preferredRoundTypes.filter(t => t !== type)
                : [...prev.preferredRoundTypes, type];
            return { ...prev, preferredRoundTypes: newTypes };
        });
    };

    const riskLevels: { id: CustomStrategyConfig['riskLevel']; label: string; icon: React.ReactElement<any> }[] = [
        { id: 'cautious', label: 'Cauteloso', icon: <TrendingDownIcon className="w-6 h-6"/> },
        { id: 'observer', label: 'Observador', icon: <SlidersIcon className="w-6 h-6"/> },
        { id: 'balanced', label: 'Equilibrado', icon: <ZapIcon className="w-6 h-6"/> },
        { id: 'opportunist', label: 'Oportunista', icon: <StarIcon className="w-6 h-6"/> },
        { id: 'aggressive', label: 'Agressivo', icon: <TrendingUpIcon className="w-6 h-6"/> },
        { id: 'explorer', label: 'Explorador', icon: <SpacemanIcon className="w-6 h-6"/> },
        { id: 'maximizer', label: 'Maximizador', icon: <BombIcon className="w-6 h-6"/> },
        { id: 'strategist', label: 'Estrategista', icon: <CpuIcon className="w-6 h-6"/> },
    ];
    
    const sessionGoals: { id: CustomStrategyConfig['sessionGoal']; label: string; icon: React.ReactElement<any> }[] = [
        { id: 'quick_wins', label: 'Ganhos Rápidos', icon: <ZapIcon className="w-6 h-6 text-yellow-300"/> },
        { id: 'long_session', label: 'Sessão Longa', icon: <HistoryIcon className="w-6 h-6 text-sky-300"/> },
    ];

    const roundTypes = ['Turbo', 'Normal', 'Lenta', 'Automática'];

    return (
        <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/30 space-y-8">
            <div>
                <label className="block text-white font-medium text-sm mb-3">Perfil de Risco</label>
                <div className="grid grid-cols-4 gap-2">
                    {riskLevels.map(({ id, label, icon }) => (
                        <button key={id} onClick={() => setConfig(p => ({ ...p, riskLevel: id }))} className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all border-2 ${config.riskLevel === id ? 'bg-purple-600/50 border-purple-400 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-purple-500/50'}`}>
                            {React.cloneElement(icon, { className: "w-6 h-6" })}
                            <span className="text-xs font-bold text-center">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-white font-medium text-sm mb-3">Objetivo da Sessão</label>
                <div className="grid grid-cols-2 gap-2">
                    {sessionGoals.map(({ id, label, icon }) => (
                        <button key={id} onClick={() => setConfig(p => ({ ...p, sessionGoal: id }))} className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all border-2 ${config.sessionGoal === id ? 'bg-purple-600/50 border-purple-400 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-purple-500/50'}`}>
                            {icon}
                            <span className="text-xs font-bold text-center">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-3">
                    <label htmlFor="attempts" className="text-white font-medium text-sm">Número de Tentativas</label>
                    <span className="text-green-400 font-bold text-lg">{config.numberOfAttempts}</span>
                </div>
                <input
                    id="attempts"
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={config.numberOfAttempts}
                    onChange={(e) => setConfig(p => ({...p, numberOfAttempts: Number(e.target.value)}))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-green-500"
                />
            </div>

            <div>
                <label className="block text-white font-medium text-sm mb-3">Tipos de Rodada Preferidos</label>
                <div className="grid grid-cols-2 gap-2">
                    {roundTypes.map(type => (
                        <button key={type} onClick={() => handleRoundTypeChange(type)} className={`p-3 rounded-lg text-center transition-all border-2 ${config.preferredRoundTypes.includes(type) ? 'bg-purple-600/50 border-purple-400 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-purple-500/50'}`}>
                            <span className="text-sm font-bold">{type}</span>
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isLoading ? 'GERANDO SINAL MANUAL...' : 'GERAR SINAL MANUAL'}
            </button>
        </div>
    );
};

const GenerationLoader: React.FC<{ gameName: string, startTime?: number }> = ({ gameName, startTime }) => {
    const [elapsed, setElapsed] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    const messages = [
        `Analisando padrões de pagamento para ${gameName}...`,
        "Cruzando dados com mais de 10.000 jogadas anteriores...",
        "Calculando a volatilidade e o ciclo do algoritmo...",
        "Determinando os pontos de entrada ideais...",
        "Otimizando a estratégia para máxima assertividade...",
        "Finalizando a geração do seu sinal exclusivo..."
    ];

    useEffect(() => {
        if (!startTime) return;
        
        const timer = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 100);

        const messageTimer = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, 35000 / messages.length);

        return () => {
            clearInterval(timer);
            clearInterval(messageTimer);
        };
    }, [startTime, messages.length]);

    const progress = Math.min(100, (elapsed / 35000) * 100);

    return (
        <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/50 text-center animate-fade-in">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Análise em Andamento</h3>
            <p className="text-gray-300 text-sm mb-6">Nossa IA está trabalhando para criar o sinal mais assertivo para você. Isso pode levar até 35 segundos.</p>
            
            <div className="space-y-4">
                <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600 overflow-hidden">
                    <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-100 ease-linear" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-white font-bold text-2xl">{Math.floor(progress)}%</p>
                <div className="h-10 flex items-center justify-center">
                    <p className="text-purple-200 animate-pulse transition-opacity duration-500">{messages[messageIndex]}</p>
                </div>
            </div>
        </div>
    );
};

const GenerationError: React.FC<{ onRetry: () => void; onBack: () => void; error: string; onClearError: () => void }> = ({ onRetry, onBack, error, onClearError }) => (
    <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-red-500/50 animate-fade-in text-center">
        <AlertTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-red-300 mb-4">Erro na Geração</h3>
        <p className="text-gray-300 text-base mb-8">{error}</p>
        <div className="space-y-4">
            <button
              onClick={() => { onClearError(); onRetry(); }}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Tentar Novamente
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Escolher Outro Jogo
            </button>
        </div>
    </div>
);

const SignalGeneratorPage: React.FC<SignalGeneratorPageProps> = ({
    gameName,
    gameIcon,
    payout,
    payoutState,
    onBack,
    signalRequestHistory,
    setSignalRequestHistory,
    onTriggerVolatility,
    volatilityCooldownEnd,
    humanSupportCooldownEnd,
    payoutSettings,
    isRevisitAfterWarning = false,
    nextPhaseDurationMinutes,
    isGenerating,
    generationStartTime,
    generationError,
    onInitiateSignalGeneration,
    onClearGenerationError,
    signalHistory
}) => {
    const [appState, setAppState] = useState<AppState>('idle');
    const [volatilityAnalysis, setVolatilityAnalysis] = useState<VolatilityAnalysis | null>(null);
    const [strategyMode, setStrategyMode] = useState<StrategyMode>('intelligent');
    const [customStrategyConfig, setCustomStrategyConfig] = useState<CustomStrategyConfig>({
        riskLevel: 'balanced',
        numberOfAttempts: 3,
        preferredRoundTypes: [],
        sessionGoal: 'quick_wins'
    });
    const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);
    
    const cooldownTimerRef = useRef<number | null>(null);

    const isLowPayout = useMemo(() => payout !== undefined && payout < payoutSettings.highPhaseMin, [payout, payoutSettings.highPhaseMin]);

    const predictedStrategy = useMemo(() => {
        // FIX: The return type of `getPredictedProfile` is `DetailedPredictionResult`, which doesn't have a top-level `profile` property.
        // The hook is simplified to always return the correct shape, and the `getPredictedProfile` function already handles the case where payoutState is undefined.
        return getPredictedProfile(gameName, payoutState, signalHistory, payoutSettings);
    }, [gameName, payoutState, signalHistory, payoutSettings]);


    const handleGenerateClick = useCallback(() => {
        const now = Date.now();
        const history = signalRequestHistory[gameName] || [];
        const recentRequests = history.filter(ts => now - ts < 2 * 60 * 1000); // 2 minutes window

        if (recentRequests.length >= 2) {
            onTriggerVolatility(gameName);
            setAppState('analyzing_volatility');
        } else {
            setSignalRequestHistory(prev => ({
                ...prev,
                [gameName]: [...recentRequests, now]
            }));
            onInitiateSignalGeneration(gameName, { customStrategy: customStrategyConfig });
        }
    }, [gameName, signalRequestHistory, onTriggerVolatility, setSignalRequestHistory, onInitiateSignalGeneration, customStrategyConfig]);

    useEffect(() => {
        if (appState === 'analyzing_volatility') {
            generateVolatilityAnalysis(gameName).then(analysis => {
                setVolatilityAnalysis(analysis);
                setAppState('cooldown');
            });
        }
    }, [appState, gameName]);
    
    useEffect(() => {
        if (isRevisitAfterWarning) {
             generateReWarningAnalysis(gameName, nextPhaseDurationMinutes ?? 5).then(analysis => {
                setVolatilityAnalysis(analysis);
                setAppState('re_warned');
            });
        }
    }, [isRevisitAfterWarning, gameName, nextPhaseDurationMinutes]);
    
    useEffect(() => {
        if (volatilityCooldownEnd && Date.now() < volatilityCooldownEnd) {
            setAppState('cooldown');
            const remainingTime = volatilityCooldownEnd - Date.now();
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
            cooldownTimerRef.current = window.setTimeout(() => {
                setAppState('idle');
            }, remainingTime);
        }

        return () => {
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
        };
    }, [volatilityCooldownEnd]);
    
    const strategyModes = [
        {
            id: 'intelligent',
            title: 'Black IA',
            description: 'Análise de probabilidade interna em tempo real.',
            icon: <CpuIcon />,
            color: 'purple',
            info: 'A Black IA usa nossa inteligência artificial para analisar a probabilidade interna do jogo em tempo real. A estratégia gerada não se baseia no Payout, mas sim na maior probabilidade de ganho para o momento atual.'
        },
        {
            id: 'predictive',
            title: 'IA Preditiva',
            description: 'Aprende com os resultados de toda a comunidade.',
            icon: <BarChartIcon />,
            color: 'green',
            info: 'A IA Preditiva é o nosso cérebro coletivo. Ela analisa o histórico de vitórias e derrotas de **todos os usuários** para identificar os padrões mais lucrativos. Cada jogada validada pela comunidade a torna mais inteligente e assertiva para você.'
        },
        {
            id: 'manual',
            title: 'Diamond IA',
            description: 'Controle total para criar sua própria estratégia.',
            icon: <SlidersIcon />,
            color: 'cyan',
            info: 'O modo Diamond oferece controle total sobre sua estratégia. O sinal gerado é 100% personalizado com base nas suas escolhas, focando na probabilidade que você define, independentemente do Payout do jogo.'
        },
    ];

    const renderContent = () => {
        if (isGenerating) {
            return <GenerationLoader gameName={gameName} startTime={generationStartTime} />;
        }
        if (generationError) {
            return <GenerationError onRetry={() => onInitiateSignalGeneration(gameName, strategyMode === 'manual' ? { customStrategy: customStrategyConfig } : undefined)} onBack={onBack} error={generationError} onClearError={onClearGenerationError} />;
        }
        
        if (humanSupportCooldownEnd && Date.now() < humanSupportCooldownEnd) {
            return <HumanSupportCooldown endTime={humanSupportCooldownEnd} onBack={onBack} />;
        }

        if ((appState === 'cooldown' || appState === 're_warned') && volatilityAnalysis) {
            const cooldownEndTime = appState === 're_warned' ? Date.now() + (nextPhaseDurationMinutes ?? 5) * 60000 : volatilityCooldownEnd;
            return (
                <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-red-500/50 animate-fade-in text-center">
                    <AlertTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-300 mb-4">{volatilityAnalysis.title}</h3>
                    <p className="text-gray-300 text-base mb-6">{volatilityAnalysis.explanation}</p>
                    <p className="text-white font-semibold mb-8">{volatilityAnalysis.recommendation}</p>
                    <button
                        onClick={onBack}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                        Entendi
                    </button>
                </div>
            );
        }

        return (
            <div className="w-full max-w-md mx-auto">
                <div className="flex flex-col space-y-4 mb-8">
                    {strategyModes.map((mode) => {
                         const isActive = strategyMode === mode.id;
                         const colorClasses = {
                             purple: {
                                active: 'bg-purple-900/50 border-purple-500 shadow-lg shadow-purple-500/20',
                                inactive: 'bg-gray-800/50 border-gray-700 hover:border-purple-500/50',
                                iconBg: 'bg-purple-500/20',
                                iconColor: 'text-purple-300',
                                radioBorder: 'border-purple-400',
                                radioFill: 'bg-purple-400'
                             },
                             green: {
                                active: 'bg-green-900/50 border-green-500 shadow-lg shadow-green-500/20',
                                inactive: 'bg-gray-800/50 border-gray-700 hover:border-green-500/50',
                                iconBg: 'bg-green-500/20',
                                iconColor: 'text-green-300',
                                radioBorder: 'border-green-400',
                                radioFill: 'bg-green-400'
                             },
                             cyan: {
                                active: 'bg-cyan-900/50 border-cyan-500 shadow-lg shadow-cyan-500/20',
                                inactive: 'bg-gray-800/50 border-gray-700 hover:border-cyan-500/50',
                                iconBg: 'bg-cyan-500/20',
                                iconColor: 'text-cyan-300',
                                radioBorder: 'border-cyan-400',
                                radioFill: 'bg-cyan-400'
                             }
                         };
                         const currentColors = colorClasses[mode.color as keyof typeof colorClasses];

                        return (
                            <button
                                key={mode.id}
                                onClick={() => setStrategyMode(mode.id as StrategyMode)}
                                className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isActive ? currentColors.active : currentColors.inactive}`}
                            >
                                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center mr-4 transition-colors duration-300 ${currentColors.iconBg}`}>
                                    {React.cloneElement(mode.icon, { className: `w-8 h-8 ${currentColors.iconColor}` })}
                                </div>
                
                                <div className="flex-grow text-left">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-lg font-bold text-white">{mode.title}</h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setInfoModal({ title: mode.title, content: mode.info });
                                            }}
                                            className="text-gray-500 hover:text-white"
                                            aria-label={`Mais informações sobre ${mode.title}`}
                                        >
                                            <InfoIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-400">{mode.description}</p>
                                </div>
                
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 transition-all duration-300 ${isActive ? currentColors.radioBorder : 'border-gray-600'}`}>
                                    {isActive && <div className={`w-3 h-3 rounded-full transition-all duration-300 ${currentColors.radioFill}`}></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {strategyMode === 'intelligent' && (
                     <div className="text-center animate-fade-in">
                        {isLowPayout && (
                             <div className="text-center text-yellow-300 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-sm mb-6 animate-fade-in">
                                <b>Atenção:</b> O payout está baixo. A IA usará uma <b>estratégia defensiva</b> para minimizar riscos e testar o algoritmo. Prossiga com cautela.
                            </div>
                        )}
                        <p className="text-gray-300 mb-6">Nossa IA analisará os padrões do jogo em tempo real para gerar um sinal com alta probabilidade de ganho. Este processo pode levar até 35 segundos.</p>
                        <button
                            onClick={() => onInitiateSignalGeneration(gameName)}
                            className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
                        >
                            INICIAR ANÁLISE BLACK IA
                        </button>
                     </div>
                )}
                
                {strategyMode === 'predictive' && (
                    <div className="text-center animate-fade-in">
                        {predictedStrategy.best.profile ? (
                            <>
                                <div className="mb-6 bg-gray-900/50 border border-green-500/30 rounded-lg p-4">
                                    <h5 className="font-bold text-green-300 text-base mb-2">Estratégia Recomendada</h5>
                                    <div>
                                        <p className="text-gray-300 text-sm">Com base no histórico deste jogo, a estratégia mais assertiva é:</p>
                                        <p className="text-2xl font-bold text-white my-1">{predictedStrategy.best.profile}</p>
                                        <p className="text-sm font-semibold text-green-400">({predictedStrategy.best.assertiveness}% de assertividade histórica)</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 mb-6">A IA usará a estratégia preditiva para gerar o sinal. Este processo pode levar até 35 segundos.</p>
                                <button
                                    onClick={() => onInitiateSignalGeneration(gameName)}
                                    className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out"
                                >
                                    INICIAR ANÁLISE PREDITIVA
                                </button>
                            </>
                        ) : (
                            <div className="mb-6 bg-gray-900/50 border border-yellow-500/30 rounded-lg p-4 text-center">
                                <HistoryIcon className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                                <h5 className="font-bold text-yellow-300 text-base mb-2">Mais Dados Necessários</h5>
                                <p className="text-gray-300 text-sm">
                                    Para ativar a IA Preditiva, precisamos de mais histórico de jogadas.
                                </p>
                                <p className="text-gray-300 text-sm mt-2">
                                    Continue jogando e validando os resultados (Lucro/Prejuízo) na tela de cada sinal para que a IA aprenda os melhores padrões para você.
                                </p>
                            </div>
                        )}
                    </div>
                )}


                {strategyMode === 'manual' && (
                    <div className="animate-fade-in">
                        {isLowPayout && (
                             <div className="text-center text-yellow-300 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-sm mb-6 -mt-4 animate-fade-in">
                                <b>Atenção:</b> O payout está baixo. O modo Diamond Manual está ativo. Jogue com extrema cautela e apostas mínimas.
                            </div>
                        )}
                        <StrategyBuilder config={customStrategyConfig} setConfig={setCustomStrategyConfig} onGenerate={() => onInitiateSignalGeneration(gameName, { customStrategy: customStrategyConfig })} isLoading={isGenerating} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto relative flex flex-col items-center">
            {infoModal && <InfoModal title={infoModal.title} content={infoModal.content} onClose={() => setInfoModal(null)} />}
            <button onClick={onBack} className="absolute top-0 -left-4 md:-left-16 flex items-center gap-2 text-gray-300 hover:text-white transition-colors z-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Voltar
            </button>
            <div className="w-full">
                <Header gameName={gameName} />
                {gameIcon && (
                    <div className="my-8 flex justify-center">
                        {React.cloneElement(gameIcon, { className: "w-32 h-32" })}
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
    );
};

export default SignalGeneratorPage;