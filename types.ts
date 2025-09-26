// New interface for dynamic attempt types
export interface Attempt {
  type: string; // e.g., 'Turbo', 'Normal', 'Lenta'
  rounds: number;
}

export interface FutureAnalysis {
  timeRange: string;
  analysisType: 'Pico de Pagamento' | 'Queda de Pagamento';
  predictedPayout: number;
}

// New type for adaptive AI strategy profiles
export type StrategyProfile = 'Cauteloso' | 'Observador' | 'Conservador' | 'Moderado' | 'Agressivo' | 'Arrojado' | 'Defensivo' | 'BaixaProbabilidade' | 'Estrategista';

export interface GeneratedSignal {
  attempts: Attempt[];
  confidenceIndex: number;
  signalReason: string; // Renamed from 'strategy'
  executionStrategy: string;
  bankrollManagementTip: string;
  payingTimeSuggestion: string;
  futureAnalyses?: FutureAnalysis[];
  isLowPayoutSignal?: boolean;
  // Add new properties to carry over context from the payout state
  isChangingSoon?: boolean;
  nextPhase?: 'high' | 'low';
  strategyProfile?: StrategyProfile;
}

export interface VolatilityAnalysis {
    title: string;
    explanation: string;
    recommendation: string;
}

// New interface for the Custom Strategy Builder
export interface CustomStrategyConfig {
  riskLevel: 'cautious' | 'observer' | 'balanced' | 'opportunist' | 'aggressive' | 'explorer' | 'maximizer' | 'strategist';
  numberOfAttempts: number;
  preferredRoundTypes: string[];
  sessionGoal: 'quick_wins' | 'long_session';
}

// FIX: Added missing SignalConfig type for the Configurator component.
export interface SignalConfig {
  payingTimes: number;
  turboRounds: number;
  normalRounds: number;
  assertiveness: number;
}

export interface PayoutState {
    payout: number;
    phase: 'high' | 'low';
    phaseStartTime: number;
    phaseEndTime: number;
    volatilityCooldownEnd: number | null;
    humanSupportCooldownEnd: number | null;
    isChangingSoon?: boolean;
    nextPhaseDurationMinutes?: number;
    nextPhase?: 'high' | 'low';
    // New properties for duration cycling
    durationMinutes: number;
    durationIndex: number;
    durationDirection: 'forward' | 'backward';
}

// FIX: Added missing GamePayoutStates type for GameSelection component.
export type GamePayoutStates = Record<string, PayoutState>;

export interface PayoutSettings {
    highPhaseMin: number;
    highPhaseMax: number;
    lowPhaseMin: number;
    lowPhaseMax: number;
    highPhaseDurationMinutes: number;
    lowPhaseDurationMinutes: number;
    volatilityCooldownMinutes: number;
    humanSupportCooldownMinutes: number;
    futureAnalysisGapMinutesMin: number;
    futureAnalysisGapMinutesMax: number;
}

// New interface for storing game data, including the category.
export interface Game {
    name: string;
    // FIX: Changed icon from React.ReactNode to React.ReactElement for type safety with React.cloneElement.
    icon: React.ReactElement;
    category: string;
}

export interface ManagedGame extends Game {
    isActive: boolean;
}

// FIX: Converted HistorySignal from a type alias to an interface extending GeneratedSignal.
// This resolves a type inference issue in App.tsx where the 'status' property was being
// incorrectly widened to a generic 'string' type during an object spread operation.
export interface HistorySignal extends GeneratedSignal {
    gameName: string;
    generatedAt: string; // The display string HH:mm
    generatedAtTimestamp: number; // The unique identification
    status: 'valid' | 'invalid' | 'finalized' | 'expired';
}

// New type for Activity Log
export interface ActivityLog {
    timestamp: number;
    type: 'user' | 'signal' | 'subscription' | 'admin';
    message: string;
}

export interface AutoApprovingUser {
    email: string;
    name: string;
    startTime: number; // Timestamp of when the approval process started
}

export interface ApprovalRecord {
    userName: string;
    userEmail: string;
    approvedAt: Date;
    approvalType: 'manual' | 'automatic';
    paymentProofDataUrl: string;
    amount: number;
}

// FIX: Added missing User type for GameSelection component.
export interface User {
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    subscription: {
        status: 'inactive' | 'processing' | 'active' | 'rejected';
        expiryDate: string | null;
        pendingProofDataUrl?: string;
    };
    favoriteGames: string[];
    notificationSettings: {
        enabled: boolean;
        newSignal: boolean;
        signalExpiration: boolean;
    };
    casinoPlatformName?: string;
    casinoPlatformLink?: string;
}

// FIX: Added Page type for navigation.
export type Page = 'generator' | 'history' | 'subscription' | 'profile' | 'admin' | 'settings' | 'info';