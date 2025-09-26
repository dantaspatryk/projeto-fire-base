import type { HistorySignal, PayoutState, PayoutSettings, StrategyProfile } from '../types';

// The result interface is useful for clarity.
export interface DetailedPredictionResult {
    best: {
        profile: StrategyProfile | null;
        assertiveness: number;
    };
    worst: {
        profile: StrategyProfile | null;
        assertiveness: number; // This is still success rate, just the lowest one.
    };
}

const calculateStatsForProfiles = (signals: HistorySignal[]): { profile: StrategyProfile, assertiveness: number, count: number }[] => {
    if (!signals || signals.length === 0) return [];
    
    const profiles = [...new Set(signals.map(s => s.strategyProfile!))];
    const stats = profiles.map(profile => {
        const relevantSignals = signals.filter(s => s.strategyProfile === profile);
        const wins = relevantSignals.filter(s => s.status === 'finalized').length;
        const losses = relevantSignals.filter(s => s.status === 'invalid').length;
        const total = wins + losses;
        if (total === 0) return { profile, assertiveness: 0, count: 0 };
        return { profile, assertiveness: Math.round((wins / total) * 100), count: total };
    });
    
    return stats.filter(s => s.count > 0); // Only return profiles that have been tried
};

export const getPredictedProfile = (
    gameName: string,
    payoutState: PayoutState | undefined,
    history: HistorySignal[],
    settings: PayoutSettings
): DetailedPredictionResult => {
    const MIN_SIGNALS_FOR_PREDICTION = 3;
    const defaultResult: DetailedPredictionResult = {
        best: { profile: null, assertiveness: 0 },
        worst: { profile: null, assertiveness: 100 }
    };

    if (!payoutState || history.length < MIN_SIGNALS_FOR_PREDICTION) {
        return defaultResult;
    }

    const gameHistory = history.filter(s =>
        s.gameName === gameName &&
        s.strategyProfile &&
        (s.status === 'finalized' || s.status === 'invalid')
    );

    if (gameHistory.length < MIN_SIGNALS_FOR_PREDICTION) {
        return defaultResult;
    }

    // Let's analyze the entire game history to find the best and worst profiles
    const allStats = calculateStatsForProfiles(gameHistory);

    if (allStats.length === 0) {
        return defaultResult;
    }

    // Find best profile
    const bestStat = allStats.reduce((prev, current) => (prev.assertiveness > current.assertiveness) ? prev : current);

    // Find worst profile - must have been tried at least twice
    const worstStat = allStats
        .filter(s => s.count >= 2)
        .reduce((prev, current) => (prev.assertiveness < current.assertiveness) ? prev : current, { profile: null, assertiveness: 101, count: 0 });

    if (bestStat && bestStat.assertiveness > 0) {
        defaultResult.best = { profile: bestStat.profile, assertiveness: bestStat.assertiveness };
    }

    // A valid anti-pattern has <= 25% success and is not the same as the best profile
    if (worstStat && worstStat.profile && worstStat.assertiveness <= 25 && worstStat.profile !== bestStat.profile) {
        defaultResult.worst = { profile: worstStat.profile, assertiveness: worstStat.assertiveness };
    }
    
    return defaultResult;
};
