import React, { useState, useEffect, useRef } from 'react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import type { GeneratedSignal, PayoutState } from '../types';

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const HelpCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const ClipboardCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="m9 14 2 2 4-4"/>
    </svg>
);


const ChangingSoonWarningModal: React.FC<{ onCancel: () => void; onContinue: () => void; nextPhaseDurationMinutes?: number }> = ({ onCancel, onContinue, nextPhaseDurationMinutes }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-yellow-500/80 text-center">
            <AlertTriangleIcon className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(250, 204, 21, 0.5)' }}>
                ALERTA DE INSTABILIDADE
            </h3>
            <p className="text-gray-200 text-base mb-4">
                Nossa IA detectou uma mudança no padrão de pagamento deste jogo. Os prêmios estão prestes a diminuir.
            </p>
            {nextPhaseDurationMinutes && (
                 <p className="text-white text-lg mb-8 bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-3">
                    Previsão de baixa probabilidade pelos próximos <b className="text-2xl font-bold">{nextPhaseDurationMinutes} minutos</b>.
                </p>
            )}
            <div className="space-y-4">
                <button
                    onClick={onContinue}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
                >
                    Continuar Com Riscos
                </button>
                <button
                    onClick={onCancel}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-yellow-500/30"
                >
                    Cancelar Sinal
                </button>
            </div>
        </div>
    </div>
);

const ImpendingChangeModal: React.FC<{
    onClose: () => void;
    onConfirm: () => void;
    gameName: string;
    nextPhase: 'high' | 'low';
}> = ({ onClose, onConfirm, gameName, nextPhase }) => {
    const isHigh = nextPhase === 'high';

    const theme = {
        borderColor: isHigh ? 'border-green-500/80' : 'border-red-500/80',
        icon: isHigh 
            ? <TrendingUpIcon className="w-20 h-20 text-green-400 mx-auto mb-4 animate-pulse" /> 
            : <TrendingDownIcon className="w-20 h-20 text-red-400 mx-auto mb-4 animate-pulse" />,
        title: isHigh ? "OPORTUNIDADE IMINENTE!" : "BAIXA PROBABILIDADE CHEGANDO",
        textShadow: isHigh ? '0 0 15px rgba(74, 222, 128, 0.5)' : '0 0 15px rgba(248, 113, 113, 0.5)',
        message: isHigh 
            ? `O padrão de pagamento do ${gameName} está prestes a melhorar! Nossa IA identificou o início de um ciclo de alta probabilidade. Para garantir a máxima assertividade e aproveitar os melhores prêmios, recomendamos invalidar este sinal atual e aguardar a nova análise otimizada.`
            : `Nossa análise detectou que o ciclo de alta probabilidade do ${gameName} está terminando. Continuar jogando com este sinal aumenta significativamente o risco de perdas. A jogada mais inteligente é proteger seus lucros e finalizar a sessão neste jogo.`,
        buttonClass: isHigh
            ? "from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black shadow-green-500/30"
            : "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-red-500/30"
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 ${theme.borderColor} text-center relative`}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 z-10" aria-label="Fechar">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                {theme.icon}
                <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: theme.textShadow }}>
                    {theme.title}
                </h3>
                <p className="text-gray-200 text-base mb-8">{theme.message}</p>
                <div className="space-y-4">
                    <button
                        onClick={onConfirm}
                        className={`w-full bg-gradient-to-r ${theme.buttonClass} font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg`}
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};


const PayoutImprovedModal: React.FC<{ onRegenerate: () => void; }> = ({ onRegenerate }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-green-500/80 text-center">
            <TrendingUpIcon className="w-20 h-20 text-green-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}>
                OPORTUNIDADE OTIMIZADA!
            </h3>
            <p className="text-gray-200 text-base mb-8">
                O payout deste jogo melhorou! Seu sinal atual foi criado para um cenário de menor probabilidade. Para maximizar seus ganhos, recomendamos gerar um novo sinal otimizado para esta oportunidade.
            </p>
            <button
                onClick={onRegenerate}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-green-500/30"
            >
                GERAR NOVO SINAL OTIMIZADO
            </button>
        </div>
    </div>
);

const FeedbackPromptModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-cyan-500/80 text-center">
            <HelpCircleIcon className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.5)' }}>
                COMO ESTÁ SUA JOGADA?
            </h3>
            <p className="text-gray-200 text-base mb-8">
                Sua experiência é crucial para nós! Por favor, role a tela para baixo até a seção <b className="text-cyan-300">"Validação do Sinal"</b> e nos informe se você está tendo bons resultados. Isso nos ajuda a refinar a análise em tempo real para você.
            </p>
            <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-cyan-500/30"
            >
                ENTENDI, VOU INFORMAR
            </button>
        </div>
    </div>
);

const ProfitCheckPromptModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-green-500/80 text-center">
            <ClipboardCheckIcon className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}>
                CONFIRME SEU LUCRO!
            </h3>
            <p className="text-gray-200 text-base mb-8">
                O período pagante está em sua reta final! É crucial que você nos informe se obteve lucro. Por favor, role a tela para baixo até a seção <b className="text-green-300">"Validação do Sinal"</b> e confirme seu resultado.
            </p>
            <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-green-500/30"
            >
                ENTENDI, VOU VALIDAR
            </button>
        </div>
    </div>
);


const ProfitConfirmedModal: React.FC<{ onFinalize: () => void; onContinue: () => void; }> = ({ onFinalize, onContinue }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-green-500/80 text-center">
            <CheckCircleIcon className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(74, 222, 128, 0.5)' }}>
                LUCRO CONFIRMADO!
            </h3>
            <p className="text-gray-200 text-lg mb-4">
                Parabéns pela sua vitória! 🚀
            </p>
            <p className="text-gray-300 text-base mb-8 bg-green-900/50 border border-green-500/50 rounded-lg p-4">
                <b>Recomendação de Jogo Responsável:</b> Os padrões do jogo mudam constantemente, especialmente após a liberação de prêmios. A jogada mais inteligente agora é <b className="text-white">proteger seu lucro e finalizar este sinal.</b>
            </p>
            <div className="space-y-4">
                <button
                    onClick={onFinalize}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-green-500/30"
                >
                    Finalizar Sinal e Sair
                </button>
                 <button
                    onClick={onContinue}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
                >
                    Entendi, mas quero continuar
                </button>
            </div>
        </div>
    </div>
);

const CancellationConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="w-full max-w-md mx-auto bg-black/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-2 border-red-500/80 text-center">
            <AlertTriangleIcon className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h3 className="text-4xl font-black text-white uppercase tracking-wider mb-4" style={{ textShadow: '0 0 15px rgba(248, 113, 113, 0.5)' }}>
                CANCELAR SINAL?
            </h3>
            <p className="text-gray-200 text-base mb-4">
                Você está usando o sinal dentro do período de tempo gerado?
            </p>
             <p className="text-white text-lg mb-8 bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                Ao confirmar, este sinal será invalidado e uma <b>análise aprofundada de 35 minutos</b> será iniciada para este jogo, garantindo a qualidade dos próximos sinais.
            </p>
            <div className="space-y-4">
                 <button
                    onClick={onConfirm}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg shadow-lg shadow-red-500/30"
                >
                    Sim, Cancelar e Analisar
                </button>
                <button
                    onClick={onCancel}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg"
                >
                    Não, quero continuar
                </button>
            </div>
        </div>
    </div>
);


interface SignalDisplayProps {
  signal: GeneratedSignal;
  onBackToSelection: () => void;
  onInvalidateSignal: (gameName: string, reason: 'warning' | 'user_cancellation' | 'profit_finalize' | 'phase_change') => void;
  isRevisit?: boolean;
  gameName: string;
  generatedAt?: number;
  currentPayout?: number;
  payoutState?: PayoutState;
  onRegenerateSignal: () => void;
  onConfirmProfit: (gameName: string) => void;
  isProfitConfirmed: boolean;
}

const SignalDisplay: React.FC<SignalDisplayProps> = ({
    signal,
    onBackToSelection,
    onInvalidateSignal,
    isRevisit,
    gameName,
    generatedAt,
    currentPayout,
    payoutState,
    onRegenerateSignal,
    onConfirmProfit,
    isProfitConfirmed
}) => {
  const [progress, setProgress] = useState(0);
  const [isStrategyExpanded, setIsStrategyExpanded] = useState(false);
  const [isReasonExpanded, setIsReasonExpanded] = useState(false);
  const [showChangingWarning, setShowChangingWarning] = useState(false);
  const [isWarningDismissed, setWarningDismissed] = useState(false);
  const [showImprovedModal, setShowImprovedModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfitCheckModal, setShowProfitCheckModal] = useState(false);
  const [shownMilestones, setShownMilestones] = useState<number[]>([]);
  const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showImpendingChangeModal, setShowImpendingChangeModal] = useState(false);
  const [isImpendingChangeDismissed, setImpendingChangeDismissed] = useState(false);
  const [improvementModalShown, setImprovementModalShown] = useState(false);
  const { isLowPayoutSignal } = signal;
  const intervalRef = useRef<number>();


  if (isLowPayoutSignal && signal.attempts?.[0]?.rounds === 0) {
    return (
      <div className="w-full max-w-md mx-auto relative">
        <button onClick={onBackToSelection} className="absolute top-0 -left-4 md:-left-16 flex items-center gap-2 text-gray-300 hover:text-white transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar
        </button>
        <div className="w-full bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-yellow-500/50 animate-fade-in text-center">
            <AlertTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center text-yellow-400 mb-6">ANÁLISE DE RISCO GERADA</h2>

            <div className="mb-6 bg-yellow-900/50 border border-yellow-500/70 rounded-lg p-4 text-center animate-fade-in">
                <p className="text-sm text-gray-200 italic">"{signal.signalReason}"</p>
            </div>

            <div className="text-left space-y-2 bg-amber-900/20 p-4 rounded-lg flex items-start gap-4">
                <ShieldIcon className="w-8 h-8 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                    <p className="text-amber-300 font-bold text-base">Recomendação da IA:</p>
                    <p className="text-gray-300 text-sm italic">"{signal.bankrollManagementTip}"</p>
                </div>
            </div>

            <button
                onClick={onBackToSelection}
                className="w-full mt-8 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
                Entendi, Voltar
            </button>
        </div>
      </div>
    );
  }

  const handleConfirmProfit = () => {
    onConfirmProfit(gameName);
    setIsProfitModalOpen(true);
  };

  const handleInitiateCancellation = () => {
    // FIX: A state setter function must be called with an argument. Changed to setShowCancelConfirm(true).
    setShowCancelConfirm(true);
  };
  
  const handleConfirmPhaseChange = () => {
    onInvalidateSignal(gameName, 'phase_change');
  };
  
  const handleDismissImpendingChange = () => {
    setShowImpendingChangeModal(false);
    setImpendingChangeDismissed(true);
  };


  useEffect(() => {
    if (isLowPayoutSignal) return;
    // Prioritization: Do not show this less-critical warning if a more important modal is already active.
    if (showImpendingChangeModal || showImprovedModal) return;

    if (payoutState?.isChangingSoon && payoutState?.nextPhase === 'low' && !isWarningDismissed) {
      setShowChangingWarning(true);
    }
  }, [payoutState, isWarningDismissed, showImpendingChangeModal, showImprovedModal, isLowPayoutSignal]);
  
  // New Effect for the 2-minute warning modal
  useEffect(() => {
    if (isLowPayoutSignal) return;
    // Prioritization: Payout improvement is a more important, positive notification.
    if (showImprovedModal) return;
    
    if (!payoutState || isImpendingChangeDismissed || !payoutState.isChangingSoon) {
        return;
    }

    const checkTime = () => {
        const now = Date.now();
        const timeLeft = payoutState.phaseEndTime - now;
        
        // Trigger between 2 minutes and 0 seconds left
        if (timeLeft > 0 && timeLeft <= 2 * 60 * 1000) {
            setShowImpendingChangeModal(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    };

    intervalRef.current = window.setInterval(checkTime, 1000);
    checkTime(); // check immediately

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
}, [payoutState, isImpendingChangeDismissed, showImprovedModal, isLowPayoutSignal]);


  useEffect(() => {
    const wasGeneratedLow = signal.strategyProfile === 'Defensivo' || signal.strategyProfile === 'Cauteloso';
    const hasImproved = currentPayout !== undefined && currentPayout >= 70;

    // Do not show if: it's a non-playable signal, it wasn't generated in a low state, payout hasn't improved,
    // or if a more critical modal is already open, or if this modal has already been shown for this signal.
    if (isLowPayoutSignal || !wasGeneratedLow || !hasImproved || showChangingWarning || showImpendingChangeModal || improvementModalShown) {
        return;
    }

    setShowImprovedModal(true);
    setImprovementModalShown(true); // Mark as shown to prevent re-triggering

  }, [currentPayout, signal.strategyProfile, isLowPayoutSignal, showChangingWarning, showImpendingChangeModal, improvementModalShown]);

  useEffect(() => {
    const timeRange = signal.payingTimeSuggestion;
    // Check if timeRange is valid
    if (!timeRange || !timeRange.includes(' - ') || timeRange.toLowerCase().includes('n/a')) {
      setProgress(100); 
      return;
    }

    const [startTimeStr, endTimeStr] = timeRange.split(' - ');
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

    const getTodayAt = (hours: number, minutes: number) => {
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    let startTime = getTodayAt(startHours, startMinutes);
    let endTime = getTodayAt(endHours, endMinutes);

    // Handle overnight times, e.g., "23:50 - 00:10"
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const totalDuration = endTime.getTime() - startTime.getTime();
    
    if (totalDuration <= 0) {
        setProgress(100);
        return;
    }
    
    const updateProgress = () => {
        const currentTime = Date.now();
        if (currentTime < startTime.getTime()) {
            setProgress(0);
        } else if (currentTime >= endTime.getTime()) {
            setProgress(100);
            if (interval) clearInterval(interval);
        } else {
            const elapsedTime = currentTime - startTime.getTime();
            const newProgress = Math.min(100, (elapsedTime / totalDuration) * 100);
            setProgress(newProgress);
            
            const criticalModalIsOpen = showChangingWarning || showImprovedModal || isProfitModalOpen || showImpendingChangeModal;
            if (criticalModalIsOpen || isWarningDismissed || isImpendingChangeDismissed) return;

            // Do not show feedback/profit check modals for low payout signals
            if (isLowPayoutSignal) return;

            // --- Feedback Modal Logic (52% and 70%) ---
            const feedbackMilestones = [52, 70];
            for (const milestone of feedbackMilestones) {
                if (newProgress >= milestone && !shownMilestones.includes(milestone)) {
                    setShowFeedbackModal(true);
                    setShownMilestones(prev => [...prev, milestone]);
                    return; // Show one modal at a time
                }
            }

            // --- Profit Check Modal Logic (80-95%) ---
            const profitCheckMilestone = 80;
            if (newProgress >= profitCheckMilestone && newProgress <= 95 && !shownMilestones.includes(profitCheckMilestone)) {
                 setShowProfitCheckModal(true);
                 setShownMilestones(prev => [...prev, profitCheckMilestone]);
                 return; // Show one modal at a time
            }
        }
    };

    const interval = setInterval(updateProgress, 1000);
    updateProgress(); // Run once immediately

    return () => clearInterval(interval);

  }, [signal.payingTimeSuggestion, shownMilestones, showChangingWarning, showImprovedModal, isProfitModalOpen, isWarningDismissed, showImpendingChangeModal, isImpendingChangeDismissed, isLowPayoutSignal]);


  const signalText = `
ENTRADA CONFIRMADA! ✅ (Confiança: ${currentPayout ?? signal.confidenceIndex}%)
Horário Pagante: ${signal.payingTimeSuggestion}
  
SEQUÊNCIA DE ENTRADA:
${signal.attempts.map((a, i) => `${i + 1}. ${a.rounds}x Rodadas ${a.type}`).join('\n')}
  
Estratégia de Execução: ${signal.executionStrategy}

Razão do Sinal: ${signal.signalReason}

⚠️ Gerenciamento de Banca: ${signal.bankrollManagementTip}

${signal.futureAnalyses && signal.futureAnalyses.length > 0 ? `
🔥 HORÁRIOS COM POSSÍVEIS ANÁLISE FUTURISTA 🔥
${signal.futureAnalyses.map(p => `- ${p.timeRange} (${p.predictedPayout}% de Payout Previsto - ${p.analysisType})`).join('\n')}
` : ''}

APÓS AS TENTATIVAS, SAIA DO JOGO E SÓ VOLTE NO PRÓXIMO SINAL!
  `;

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(signalText.trim());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderFeedbackSection = () => {
      if (isLowPayoutSignal) {
          return (
             <div className="border-t border-yellow-500/30 my-6 pt-6 text-center bg-yellow-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-300 mb-3">Jogando por Conta e Risco</h4>
                <p className="text-gray-300 text-sm mt-2">Este sinal foi gerado por sua própria conta e risco. Aconselhamos esperar uma oportunidade de melhor fluxo.</p>
            </div>
          );
      }

      if (isWarningDismissed || isImpendingChangeDismissed) {
          return (
             <div className="border-t border-yellow-500/30 my-6 pt-6 text-center bg-yellow-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-300 mb-3">Jogando por Conta e Risco</h4>
                <p className="text-gray-300 text-sm mt-2">Você optou por continuar apesar do alerta da IA sobre a mudança de padrão do jogo. A validação de sinal está desativada para esta sessão. Jogue com responsabilidade.</p>
            </div>
          );
      }

      if (isProfitConfirmed) {
          return (
             <div className="border-t border-green-500/30 my-6 pt-6 text-center bg-green-900/20 p-6 rounded-lg">
                <h4 className="text-xl font-bold text-green-300 mb-3">Lucro Confirmado! Parabéns! 🚀</h4>
                <p className="text-gray-300 font-semibold text-base">Recomendação de Jogo Responsável:</p>
                <p className="text-gray-300 text-sm mt-2">Sugerimos fortemente que você <b className="text-white">conserve seu lucro e descarte o restante do tempo deste sinal</b>. Os padrões do jogo mudam constantemente, especialmente após a liberação de prêmios. Proteger seu capital agora é a jogada mais inteligente.</p>
            </div>
          );
      }
      
      const areButtonsDisabled = progress < 25;

      return (
            <div className="border-t border-purple-500/30 my-6 pt-6 text-center">
                <h4 className="text-lg font-bold text-white mb-4">Validação do Sinal</h4>
                <p className="text-sm text-gray-400 mb-6">Como está sua jogada? Seu feedback nos ajuda a refinar a análise.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleConfirmProfit}
                        disabled={areButtonsDisabled}
                        className="w-full flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🚀 LUCREI, QUERO FINALIZAR!
                    </button>
                    <button
                        onClick={handleInitiateCancellation}
                        disabled={areButtonsDisabled}
                        className="w-full flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        NÃO ESTOU GANHANDO ❌
                    </button>
                </div>
                {areButtonsDisabled && (
                    <p className="text-xs text-yellow-400 mt-3">Aguarde o sinal atingir 25% de progresso para validar o resultado.</p>
                )}
            </div>
      );
  };

  const renderProgressBarContent = () => {
      return (
           <>
              <p className="text-6xl font-bold text-white mb-2" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}>{Math.floor(progress)}%</p>
              <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600 overflow-hidden">
                  <div 
                      className={`${isLowPayoutSignal ? 'bg-yellow-500' : 'bg-green-500'} h-full transition-all duration-1000 ease-linear`}
                      style={{ width: `${progress}%` }}
                  ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Progresso do Horário Pagante</p>
          </>
      );
  };


  return (
    <>
      {showChangingWarning && <ChangingSoonWarningModal 
          onCancel={() => onInvalidateSignal(gameName, 'warning')} 
          onContinue={() => {
              setShowChangingWarning(false);
              setWarningDismissed(true); // Prevents modal from re-opening for this instance
          }}
          nextPhaseDurationMinutes={payoutState?.nextPhaseDurationMinutes} 
      />}
      {showImpendingChangeModal && payoutState?.nextPhase && (
        <ImpendingChangeModal
            gameName={gameName}
            nextPhase={payoutState.nextPhase}
            onClose={handleDismissImpendingChange}
            onConfirm={handleConfirmPhaseChange}
        />
      )}
      {showImprovedModal && <PayoutImprovedModal onRegenerate={onRegenerateSignal} />}
      {showFeedbackModal && <FeedbackPromptModal onClose={() => setShowFeedbackModal(false)} />}
      {showProfitCheckModal && <ProfitCheckPromptModal onClose={() => setShowProfitCheckModal(false)} />}
      {isProfitModalOpen && (
        <ProfitConfirmedModal
            onFinalize={() => {
                onInvalidateSignal(gameName, 'profit_finalize');
                setIsProfitModalOpen(false);
            }}
            onContinue={() => {
                setIsProfitModalOpen(false);
            }}
        />
      )}
      {showCancelConfirm && (
        <CancellationConfirmModal 
            onConfirm={() => {
                setShowCancelConfirm(false);
                onInvalidateSignal(gameName, 'user_cancellation');
            }}
            onCancel={() => setShowCancelConfirm(false)}
        />
      )}
      <div className="w-full max-w-md mx-auto relative">
        <button onClick={onBackToSelection} className="absolute top-0 -left-4 md:-left-16 flex items-center gap-2 text-gray-300 hover:text-white transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar
        </button>
        <div className={`w-full bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border ${isLowPayoutSignal ? 'border-yellow-500/50' : 'border-green-500/50'} animate-fade-in`}>
            {isRevisit && (
                <div className="mb-6 bg-blue-900/50 border border-blue-500/70 rounded-lg p-4 text-center animate-fade-in">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">Sinal Ativo Detectado!</h3>
                    <p className="text-sm text-gray-300">Nossa análise identificou que o sinal anterior para este jogo ainda está no período de validade e continua sendo a melhor oportunidade. Gerar um novo sinal agora seria desnecessário e poderia interromper o padrão de ganhos atual. Recomendamos que continue seguindo a estratégia abaixo.</p>
                </div>
            )}
            <div className="text-center mb-4">
                <h2 className="text-4xl font-bold text-white mb-3 tracking-wide">{gameName}</h2>
                {signal.strategyProfile ? (
                    <div className="inline-block bg-purple-900/50 border border-purple-500/70 rounded-full px-4 py-1 animate-fade-in">
                        <span className="text-sm font-semibold text-purple-300">Perfil Ativado: </span>
                        <span className="text-sm font-bold text-white">{signal.strategyProfile}</span>
                    </div>
                ) : (
                     <div className="inline-block bg-cyan-900/50 border border-cyan-500/70 rounded-full px-4 py-1 animate-fade-in">
                        <span className="text-sm font-semibold text-cyan-300">Modo Ativado: </span>
                        <span className="text-sm font-bold text-white">Diamond IA Manual</span>
                    </div>
                )}
            </div>
            
            <div className="text-center mb-6">
            <div className={`flex justify-center items-baseline gap-2 ${isLowPayoutSignal ? 'text-yellow-400' : 'text-green-400'} mb-4`} style={{ textShadow: `0 0 10px ${isLowPayoutSignal ? 'rgba(250, 204, 21, 0.5)' : 'rgba(74, 222, 128, 0.5)'}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider">Índice de Confiança</p>
                <p className="text-lg font-bold">({currentPayout ?? signal.confidenceIndex}%)</p>
            </div>

            {generatedAt && (
                <div>
                    {renderProgressBarContent()}
                </div>
            )}
            </div>
            
            {isLowPayoutSignal && (
                <div className="mb-6 bg-yellow-900/50 border border-yellow-500/70 rounded-lg p-4 text-center animate-fade-in">
                    <h3 className="text-lg font-bold text-yellow-300 mb-2">Análise de Risco</h3>
                    <p className="text-sm text-gray-300 italic">"{signal.signalReason}"</p>
                </div>
            )}

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-4">
            <div className="text-center">
                <span className="font-semibold text-white">Horário Pagante:</span>
                <span className={`block font-bold text-2xl ${isLowPayoutSignal ? 'text-yellow-400' : 'text-green-400'} bg-green-900/50 px-3 py-1 rounded-md mt-1`}>{signal.payingTimeSuggestion}</span>
                <p className="text-xs text-center text-gray-400 mt-2">Utilize este sinal estritamente dentro do período acima.</p>
            </div>
            
            <div className="border-t border-gray-700 my-4 pt-4">
                <p className="text-white font-semibold text-center text-lg mb-4">SEQUÊNCIA DE ENTRADA</p>
                <div className="space-y-3">
                    {signal.attempts.map((attempt, index) => (
                    <div key={index} className="bg-gray-800/60 border border-purple-500/30 rounded-lg p-4 flex items-center justify-between transition-transform hover:scale-105">
                        <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm shadow-md">{index + 1}</span>
                        <span className="font-semibold text-white text-lg">Rodadas {attempt.type}</span>
                        </div>
                        <span className="text-xl font-bold text-green-400 bg-green-900/50 px-4 py-1 rounded-md border border-green-500/30">{attempt.rounds}x</span>
                    </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
                <button onClick={() => setIsStrategyExpanded(!isStrategyExpanded)} className="w-full flex justify-between items-center text-left py-2" aria-expanded={isStrategyExpanded}>
                    <p className="text-white font-semibold text-base">Estratégia de Execução</p>
                    <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isStrategyExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isStrategyExpanded && (
                    <p className="mt-2 text-gray-300 text-sm italic animate-fade-in">"{signal.executionStrategy}"</p>
                )}
            </div>
            
            {!isLowPayoutSignal && (
                <div className="border-t border-gray-700 pt-4">
                    <button onClick={() => setIsReasonExpanded(!isReasonExpanded)} className="w-full flex justify-between items-center text-left py-2" aria-expanded={isReasonExpanded}>
                        <p className="text-white font-semibold text-base">Razão do Sinal</p>
                        <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isReasonExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isReasonExpanded && (
                        <p className="mt-2 text-gray-300 text-sm italic animate-fade-in">"{signal.signalReason}"</p>
                    )}
                </div>
            )}
            
            {signal.futureAnalyses && signal.futureAnalyses.length > 0 && (
                <>
                <div className="border-t border-cyan-500/30 my-4"></div>
                <div className="text-left space-y-4">
                    <p className="text-cyan-300 font-semibold text-base">🔥 POSSÍVEIS ANÁLISE FUTURISTAS</p>
                    <div className="space-y-2">
                    {signal.futureAnalyses.map((analysis, index) => (
                        <div key={index} className="bg-cyan-900/40 p-3 rounded-lg border border-cyan-500/30">
                        <p className="font-bold text-white text-sm">{analysis.timeRange}</p>
                        <p className="text-xs text-cyan-200">{analysis.analysisType} ({analysis.predictedPayout}% Payout Previsto)</p>
                        </div>
                    ))}
                    </div>
                </div>
                </>
            )}
            </div>

            {renderFeedbackSection()}

            <div className="mt-8">
                <button
                    onClick={handleShareToWhatsApp}
                    className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                >
                    <WhatsAppIcon className="w-6 h-6"/>
                    Compartilhar no WhatsApp
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default SignalDisplay;
