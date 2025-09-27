import { supabase } from './services/supabaseClient'; // Importe o cliente Supabase
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import { default as SignalDisplay } from './components/SignalDisplay';
import SignalGeneratorPage from './components/SignalGeneratorPage';
import ProfilePage from './components/ProfilePage';
import ChangingPhaseInterstitial from './components/ChangingPhaseInterstitial';
import type { GeneratedSignal, VolatilityAnalysis, CustomStrategyConfig, PayoutState, FutureAnalysis, PayoutSettings, Game, HistorySignal, ManagedGame, ActivityLog, AutoApprovingUser, ApprovalRecord, User, GamePayoutStates, Page } from './types';
import HistoryPage from './components/HistoryPage';
import InformationPage from './components/InformationPage';
import { generateSignal } from './services/geminiService';
import GameSelection from './components/GameSelection';
import WhatsAppIcon from './components/icons/WhatsAppIcon';
import ApprovalHistoryModal from './components/ApprovalHistoryModal';


interface SignalRequestRecord {
    [gameName: string]: number[]; // Array of timestamps
}

interface ActiveSignal {
    signal: GeneratedSignal;
    gameName: string;
    generatedAt: number; // Timestamp
    profitConfirmed?: boolean;
}

// New type for system-wide settings controlled by admin
interface SystemSettings {
    announcement: string;
}




// === ICONS (inlined) ===
const OxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-red-400"
    {...props}
  >
    <path d="M16 8.32a2.5 2.5 0 0 0-3.41-3.53l-.22.22a2.5 2.5 0 0 0-3.53 3.41L12 12l-2.12-2.12a2.5 2.5 0 0 0-3.54 3.54L8.5 15.58M12 12l2.12 2.12a2.5 2.5 0 0 0 3.54-3.54L15.5 8.42" />
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M7 13c.76-2.5.76-5 0-7.5" />
    <path d="M17 13c-.76-2.5-.76-5 0-7.5" />
  </svg>
);

const TigerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-orange-400"
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M18 10a6 6 0 0 0-12 0" />
    <path d="M12 14c2.21 0 4-1.79 4-4" />
    <path d="M12 14c-2.21 0-4-1.79 4-4" />
    <path d="M12 18v-4" />
    <path d="M15 15l1.5 1.5" />
    <path d="M9 15l-1.5 1.5" />
  </svg>
);

const MouseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-pink-400"
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 12a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" />
    <path d="M17 6a5 5 0 0 0-10 0" />
    <path d="M12 12V9" />
  </svg>
);

const MinesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-cyan-400"
        {...props}
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M8 9.88V14a4 4 0 1 0 8 0V9.88" />
        <path d="m12 6-3.03 2.97a2.5 2.5 0 0 0 0 3.53L12 15.5l3.03-2.97a2.5 2.5 0 0 0 0-3.53Z" />
    </svg>
);

const RabbitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M15.5 14.5c-1.5 1.5-3.5 1.5-5 0" />
        <path d="M10 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
        <path d="M15 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
        <path d="M9.5 9.5c0-2 1-3.5 2.5-3.5s2.5 1.5 2.5 3.5" />
        <path d="M9 4.5c0-1.5 1-2.5 2-2.5" />
        <path d="M15 4.5c0-1.5-1-2.5-2-2.5" />
    </svg>
);

const DragonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M15.5 9s-1.5 2-3.5 2-3.5-2-3.5-2" />
        <path d="M10 14s.5 2 2 2 2-2 2-2" />
        <path d="M7.5 12s-1-4 4.5-4 4.5 4 4.5 4" />
        <path d="M16.5 12c-2.5 2.5-8.5 2.5-11 0" />
    </svg>
);

const GaneshaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M10 10h.01" />
        <path d="M14 10h.01" />
        <path d="M12 14c-1.5 0-3 1-3 3v1h6v-1c0-2-1.5-3-3-3z" />
        <path d="M7 11c-1 0-2 1-2 2s1 2 2 2" />
        <path d="M17 11c1 0 2 1 2 2s-1 2-2 2" />
        <path d="M12 17c-2 0-2 2-1 3s3 1 4 0" />
    </svg>
);

const BanditoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <circle cx="9" cy="10" r="1" />
        <circle cx="15" cy="10" r="1" />
        <path d="M12 14c-2 0-3 1-3 2v1h6v-1c0-1-1-2-3-2z" />
        <path d="M6 8c0-3 2-5 6-5s6 2 6 5H6z" />
        <path d="M14 17a2 2 0 0 0-4 0" />
    </svg>
);

const SugarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fuchsia-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        <path d="M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
        <path d="M16 12a4 4 0 0 1-4 4" />
        <path d="M8 12a4 4 0 0 0 4 4" />
        <path d="M12 8a4 4 0 0 1 4 4" />
        <path d="M12 8a4 4 0 0 0-4 4" />
    </svg>
);

const BonanzaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M14.5 14.5c-1 1-2.5 1-3.5 0s-1-2.5 0-3.5 2.5-1 3.5 0" />
        <path d="M11 11l-2.5-2.5" />
        <path d="M15.5 15.5L13 13" />
        <path d="M10 14l-1.5 1.5" />
        <path d="M14 10l1.5-1.5" />
    </svg>
);

const OlympusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M13.29 7.71 10.5 12l2.79 4.29" />
        <path d="M16 12h-5.5" />
        <path d="M8 12h.01" />
    </svg>
);

const DogHouseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 18v-3" />
        <path d="M12 9a3 3 0 0 1-3 3H8a4 4 0 0 0 0 8h8a4 4 0 0 0 0-8h-1a3 3 0 0 1-3-3V6" />
        <path d="M12 6l2 2" />
        <path d="M12 6l-2 2" />
    </svg>
);

const AviatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M15.14 8.86 8.86 15.14"/>
        <path d="M16.5 12A4.5 4.5 0 0 0 7.5 12a4.5 4.5 0 0 0 1.41 3.24L12 12l3.12-3.12A4.49 4.49 0 0 0 16.5 12Z"/>
    </svg>
);

const SpacemanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 12a5 5 0 0 0 5-5H7a5 5 0 0 0 5 5z"/>
        <path d="M12 12v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-5"/>
    </svg>
);

const PlinkoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <circle cx="12" cy="8" r="1"/>
        <circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/>
        <circle cx="12" cy="14" r="1"/><circle cx="8" cy="17" r="1"/>
        <circle cx="16" cy="17" r="1"/>
    </svg>
);

const StarlightPrincessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m12 3-1.5 4.5-4.5 1.5 4.5 1.5L12 15l1.5-4.5 4.5-1.5-4.5-1.5L12 3z"/>
        <path d="M19 19-3-3"/>
     </svg>
);

const MoneyTrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M7 17v-4.5a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 17 12.5V17"/>
        <path d="M17 17H7"/>
        <circle cx="8.5" cy="17" r="1.5"/><circle cx="15.5" cy="17" r="1.5"/>
        <path d="M10 10V8"/><path d="M14 10V8"/>
    </svg>
);

// === NEW ICONS ===
const CrazyTimeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M12 12v-4"/><path d="M16.2 16.2 12 12"/>
        <path d="M10 6.2a6 6 0 0 0-3.8 9.8"/>
    </svg>
);

const RouletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="m12 12-4 4"/><path d="m12 12 4 4"/><path d="m12 12-4-4"/><path d="m12 12 4-4"/><path d="m12 12-6 0"/>
        <path d="m12 12 6 0"/><path d="m12 12 0-6"/><path d="m12 12 0 6"/>
        <circle cx="12" cy="12" r="2.5"/>
    </svg>
);

const LiveBlackjackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M10 9v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"/>
        <path d="M7 8h3v10H7z"/>
    </svg>
);

const BacBoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <rect x="8" y="8" width="8" height="8" rx="1.5"/>
        <circle cx="10" cy="10" r=".5"/><circle cx="14" cy="14" r=".5"/>
        <circle cx="14" cy="10" r=".5"/><circle cx="10" cy="14" r=".5"/>
    </svg>
);

const JetXIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M8 16.5 12 12l-1.5-1.5L8 12l4-4.5 1.5 1.5-2.5 2.5 4 4Z"/>
    </svg>
);

const PenaltyShootoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 8.34V4"/><path d="M12 20v-4.34"/>
        <path d="M15.66 12H20"/><path d="M4 12h4.34"/>
        <path d="m15.1 15.1-2.3-2.3"/><path d="m6.6 6.6 2.3 2.3"/>
        <path d="m15.1 8.9-2.3 2.3"/><path d="m6.6 17.4 2.3-2.3"/>
    </svg>
);

// === MORE NEW ICONS ===
const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const MidasHandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12h.01"/><path d="M9 8h.01"/><path d="M12 7h.01"/><path d="M15 8h.01"/><path d="M16 12h.01"/><path d="M15 16h.01"/><path d="M12 17h.01"/><path d="M9 16h.01"/><path d="M11 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/><path d="M18 11c0-2.76-2.24-5-5-5s-5 2.24-5 5"/></svg>);
const FishIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12l-2 2 2 2"/><path d="M17.5 9.5c-1.5 0-3 1-4.5 2.5-1.5-1.5-3-2.5-4.5-2.5-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c.5 0 1-.15 1.5-.4L12 16l2-2-.5-1.5c.5.25 1 .4 1.5.4 1.38 0 2.5-1.12 2.5-2.5S18.88 9.5 17.5 9.5z"/></svg>);
const BombIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="5"/><path d="m15.5 8.5 2 2"/><path d="M12 6V4"/><path d="m17 15 2 .5"/></svg>);
const MentalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m8 16 2-4-2-4"/><path d="m16 16-2-4 2-4"/><path d="M12 12h.01"/></svg>);
const DiamondIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8.5 8.5 12 12l3.5-3.5L12 5l-3.5 3.5zM8.5 15.5 12 12l3.5 3.5L12 19l-3.5-3.5z"/><path d="m5 12 3.5 3.5L12 12l-3.5-3.5L5 12z"/><path d="m19 12-3.5 3.5L12 12l3.5-3.5L19 12z"/></svg>);
const LionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12a3 3 0 1 1 6 0"/><path d="M10 15s1 1 2 1 2-1 2-1"/><path d="M15 10s0-1-1-1-2 0-2 0"/><path d="M9 10s0-1 1-1 2 0 2 0"/><path d="M7 6s1 4 5 4 5-4 5-4"/></svg>);
const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><rect x="7" y="9" width="10" height="7" rx="1.5"/><path d="M10 9V8c0-1.1.9-2 2-2s2 .9 2 2v1"/></svg>);
const DiscoBallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8h.01"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M8 12h.01"/><path d="M16 12h.01"/><path d="M9 15h.01"/><path d="M15 15h.01"/><path d="M12 16h.01"/><path d="M12 6V4"/></svg>);
const MonopolyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 17v-5h8v5"/><path d="M8 12h8v-2a4 4 0 0 0-8 0v2z"/><path d="M6 17h12"/></svg>);
const DiceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><rect x="8" y="8" width="8" height="8" rx="1.5"/><circle cx="12" cy="12" r=".5"/></svg>);

// === 34 NEW ICONS ===
const PiggyRichesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-300" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M15 9a3 3 0 0 0-3-3H9v3"/><path d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M9 6V4h3c1.66 0 3 1.34 3 3"/></svg>);
const GonzoQuestMegawaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 10h6m-6 4h6m-8-2H5m14 0h-2m-9 4v2m8-2v2m-4-12V4"/></svg>);
const BonanzaMegawaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14h8m-10-4h12L15 6H9z"/><path d="M7 10l-2 4h14l-2-4"/></svg>);
const ExtraChilliIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M14.5 11c-2 2-4.5 3.5-6.5 3.5-2.5 0-3-2.5-1-4.5s3.5-3.5 6-3.5c.83 0 1.5.17 2 .5"/><path d="M15 7c-1-1-2.5-1.5-4-1.5"/></svg>);
const PrimateKingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-800" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 12h6m-4 3h2m-5-8a3 3 0 0 1 6 0v1H8z"/><path d="M12 6V4h-1m2 0h1"/></svg>);
const RiseOfOlympusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m10 8 4 4-2 5-2-3z"/><circle cx="12" cy="12" r="7"/></svg>);
const VikingRunecraftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 5v14m-4-7h8m-8-5 4 2 4-2m-8 10 4-2 4 2"/></svg>);
const DeadwoodIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="10" cy="11" r="1"/><circle cx="14" cy="11" r="1"/><path d="M10 15h4v-1h-4z"/><path d="M7 9c0-2.5 2-4 5-4s5 1.5 5 4h-2c0-1.5-1-2-3-2s-3 .5-3 2z"/></svg>);
const TombstoneRIPIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 18v-8c0-1.5 1-3 3-3s3 1.5 3 3v8h-6zm2-4h2"/></svg>);
const SanQuentinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M10 14H8a2 2 0 1 0 0 4h2m4-4h2a2 2 0 1 1 0 4h-2m-4-6V9m4 3V9m-2-2V6"/></svg>);
const PunkRockerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 5h8M9 9V4l3 3 3-3v5"/></svg>);
const Reactoonz2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/><path d="M9 14s1 1 3 1 3-1 3-1"/></svg>);
const GigantoonzIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="1"/><path d="M8 15s1 2 4 2 4-2 4-2"/><path d="M9 10a3.5 3.5 0 0 1 6 0"/></svg>);
const JamminJars2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 16h6v-6H9v6zm0-6V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M14 11h-1a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1"/></svg>);
const FatRabbitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16a4 4 0 0 0 0-8m-2-2 1-2m4 2-1-2"/><circle cx="10.5" cy="11.5" r=".5"/><circle cx="13.5" cy="11.5" r=".5"/></svg>);
const MoneyTrain4Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-700" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 17v-5h8v5H8zm-2 0h12m-9-7V8m2 2V8"/><path d="M12 10V8"/></svg>);
const TempleTumbleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 18v-4h8v4H8zm-2-4v-4h12v4H6zm2-4V6h8v4H8z"/></svg>);
const BigBambooIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 4v16m6-16v16m-5-8h4m-4-4h4m-4 8h4"/></svg>);
const ChaosCrewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-lime-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="10" cy="11" r="1"/><circle cx="14" cy="11" r="1"/><path d="m15 15-3-2-3 2m-2-8 8 8"/></svg>);
const DorkUnitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-300" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="10" cy="10" r="2"/><circle cx="14" cy="10" r="2"/><path d="M9 15a4 4 0 0 0 6 0v-1H9zM12 10h-2m4 0h2"/></svg>);
const HandOfAnubisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0v6m-4-6h8"/></svg>);
const RaptorDoublemaxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M9 9a3 3 0 0 1 3-3m3 3a3 3 0 0 0-3-3m-3 8 3-5m3 5-3-5"/></svg>);
const MultiFlyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="1.5"/><path d="M15 9s-1 2-3 2-3-2-3-2m-2 7 1-2m10 2-1-2"/></svg>);
const ValleyOfTheGodsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6 7 18h10L12 6z"/><path d="M10 12h4"/></svg>);
const TomeOfMadnessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 6h8v12H8V6zm4 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2v2"/></svg>);
const SweetBonanzaXmasIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m15 15-6-6m6 0-6 6"/><path d="M12 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2z"/></svg>);
const PekingLuckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12c-3 0-6 2-6 5h12c0-3-3-5-6-5zm-4-2a4 4 0 1 1 8 0"/><path d="M12 12v-2"/></svg>);
const LuckyNekoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M14 13h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2zm-5-3h1m3 0h1m-5 5v2m4-2v2"/><path d="M9 8a3 3 0 0 1 3-3v3"/></svg>);
const DreamCatcherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m12 12-4-2m4 2 4-2m-4 2-2 4m4-4 2 4m-2-4-4 2m4-2 4 2m-4-2 2-4m-2 4-2-4"/><circle cx="12" cy="12" r="2"/></svg>);
const MegaBallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="5"/><path d="M12 9.5 13 12h-2l1 2.5"/></svg>);
const GonzoTreasureHuntIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m15 9-6 6m0-6 6 6"/></svg>);
const FootballStudioIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 2v20"/><path d="M12 12c-3.866 0-7-2.239-7-5s3.134-5 7-5 7 2.239 7 5-3.134 5-7 5z"/></svg>);
const CashOrCrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 15a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6zm-2 2h4v-2h-4z"/></svg>);


const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 9.5a2 2 0 0 1-2.5 2.5 2 2 0 0 1-2.5-2.5A2.5 2.5 0 0 1 12 5a2.5 2.5 0 0 1 2.5 4.5z"/>
        <path d="M9 12c0 3 2.5 5 5 5s5-2 5-5"/>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5"/>
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

const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="M12 11h4"/><path d="M12 16h4"/>
        <path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
);


// === NAVIGATION ICONS ===
const GeneratorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73L12 3z"/><path d="M4 4h.01"/><path d="M20 20h.01"/>
    </svg>
);

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
    </svg>
);

const InfoIconNav: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const SubscriptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 2 l7 4.5v5c0 4-7 6.5-7 6.5s-7-2.5-7-6.5v-5L12 2z" /><path d="m10 12.5 2 2 4-4" />
    </svg>
);

const ProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const AdminIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const AlertTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const BarChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const allGames: Game[] = [
  // Populares
  { name: 'Fortune OX', icon: <OxIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Fortune Tiger', icon: <TigerIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Fortune Mouse', icon: <MouseIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Mines', icon: <MinesIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Aviator', icon: <AviatorIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Spaceman', icon: <SpacemanIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Plinko', icon: <PlinkoIcon className="w-16 h-16" />, category: 'Populares' },
  { name: 'Wanted Dead or a Wild', icon: <BanditoIcon className="w-16 h-16 text-amber-700" />, category: 'Populares' },
  
  // Cassino ao Vivo & Game Shows
  { name: 'Crazy Time', icon: <CrazyTimeIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Roleta Brasileira', icon: <RouletteIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Lightning Roulette', icon: <LightningIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Blackjack ao Vivo', icon: <LiveBlackjackIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Bac Bo', icon: <BacBoIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Monopoly Live', icon: <MonopolyIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Funky Time', icon: <DiscoBallIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Deal or No Deal Live', icon: <BriefcaseIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Super Sic Bo', icon: <DiceIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Dragon Tiger Live', icon: <DragonIcon className="w-16 h-16 text-red-500" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Dream Catcher', icon: <DreamCatcherIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Mega Ball', icon: <MegaBallIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Gonzo\'s Treasure Hunt Live', icon: <GonzoTreasureHuntIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Football Studio Dice', icon: <FootballStudioIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  { name: 'Cash or Crash Live', icon: <CashOrCrashIcon className="w-16 h-16" />, category: 'Cassino ao Vivo & Game Shows' },
  
  // Originais & Crash Games
  { name: 'JetX', icon: <JetXIcon className="w-16 h-16" />, category: 'Originais & Crash Games' },
  { name: 'Luva de Pedreiro', icon: <PenaltyShootoutIcon className="w-16 h-16" />, category: 'Originais & Crash Games' },
  { name: 'Big Bass Crash', icon: <FishIcon className="w-16 h-16 text-red-500" />, category: 'Originais & Crash Games' },
  
  // Slots de Ganhos Altos
  { name: 'Sugar Rush', icon: <SugarIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Sweet Bonanza', icon: <BonanzaIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Gates of Olympus', icon: <OlympusIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Starlight Princess', icon: <StarlightPrincessIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Fruit Party', icon: <SugarIcon className="w-16 h-16 text-lime-500" />, category: 'Slots de Ganhos Altos' },
  { name: 'The Hand of Midas', icon: <MidasHandIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Gems Bonanza', icon: <DiamondIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  { name: 'Wisdom of Athena', icon: <OlympusIcon className="w-16 h-16 text-amber-300" />, category: 'Slots de Ganhos Altos' },
  { name: 'Starlight Princess 1000', icon: <StarlightPrincessIcon className="w-16 h-16 text-pink-300" />, category: 'Slots de Ganhos Altos' },
  { name: 'Zeus vs Hades', icon: <OlympusIcon className="w-16 h-16 text-red-500" />, category: 'Slots de Ganhos Altos' },
  { name: 'The Dog House', icon: <DogHouseIcon className="w-16 h-16 text-amber-800" />, category: 'Slots de Ganhos Altos' },
  { name: 'Sweet Bonanza Xmas', icon: <SweetBonanzaXmasIcon className="w-16 h-16" />, category: 'Slots de Ganhos Altos' },
  
  // Megaways
  { name: 'The Dog House Megaways', icon: <DogHouseIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Buffalo King Megaways', icon: <OxIcon className="w-16 h-16 text-orange-700" />, category: 'Megaways' },
  { name: 'Madame Destiny Megaways', icon: <StarlightPrincessIcon className="w-16 h-16 text-purple-500" />, category: 'Megaways' },
  { name: 'Chilli Heat Megaways', icon: <BonanzaIcon className="w-16 h-16 text-red-600" />, category: 'Megaways' },
  { name: 'Great Rhino Megaways', icon: <OxIcon className="w-16 h-16 text-gray-500" />, category: 'Megaways' },
  { name: '5 Lions Megaways', icon: <LionIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Wild West Gold Megaways', icon: <BanditoIcon className="w-16 h-16 text-yellow-600" />, category: 'Megaways' },
  { name: 'Piggy Riches Megaways', icon: <PiggyRichesIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Gonzo\'s Quest Megaways', icon: <GonzoQuestMegawaysIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Bonanza Megaways', icon: <BonanzaMegawaysIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Extra Chilli Megaways', icon: <ExtraChilliIcon className="w-16 h-16" />, category: 'Megaways' },
  { name: 'Temple Tumble Megaways', icon: <TempleTumbleIcon className="w-16 h-16" />, category: 'Megaways' },
  
  // Aventura & Mitologia
  { name: 'Rabbit\'s Riches', icon: <RabbitIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Dragon Hatch', icon: <DragonIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Ganesha Gold', icon: <GaneshaIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Wild Bandito', icon: <BanditoIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'John Hunter and the Book of Tut', icon: <BanditoIcon className="w-16 h-16 text-yellow-600" />, category: 'Aventura & Mitologia' },
  { name: 'Book of Dead', icon: <GaneshaIcon className="w-16 h-16 text-amber-600" />, category: 'Aventura & Mitologia' },
  { name: 'Gonzo\'s Quest', icon: <BanditoIcon className="w-16 h-16 text-stone-500" />, category: 'Aventura & Mitologia' },
  { name: 'Legacy of Dead', icon: <GaneshaIcon className="w-16 h-16 text-black" />, category: 'Aventura & Mitologia' },
  { name: 'Floating Dragon', icon: <DragonIcon className="w-16 h-16 text-pink-400" />, category: 'Aventura & Mitologia' },
  { name: 'Primate King', icon: <PrimateKingIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Rise of Olympus', icon: <RiseOfOlympusIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Viking Runecraft', icon: <VikingRunecraftIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Big Bamboo', icon: <BigBambooIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Hand of Anubis', icon: <HandOfAnubisIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Raptor Doublemax', icon: <RaptorDoublemaxIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'MultiFly!', icon: <MultiFlyIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Valley of the Gods', icon: <ValleyOfTheGodsIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Rich Wilde and the Tome of Madness', icon: <TomeOfMadnessIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Peking Luck', icon: <PekingLuckIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },
  { name: 'Lucky Neko Gigablox', icon: <LuckyNekoIcon className="w-16 h-16" />, category: 'Aventura & Mitologia' },

  // Jogos de Cartas
  { name: 'Poker', icon: <BonanzaIcon className="w-16 h-16 text-blue-600" />, category: 'Jogos de Cartas' },
  { name: 'Blackjack', icon: <GaneshaIcon className="w-16 h-16 text-gray-200" />, category: 'Jogos de Cartas' },
  { name: 'Baccarat', icon: <OlympusIcon className="w-16 h-16 text-red-700" />, category: 'Jogos de Cartas' },
  { name: 'Video Poker', icon: <MoneyTrainIcon className="w-16 h-16 text-cyan-600" />, category: 'Jogos de Cartas' },
  
  // Outros
  { name: 'Money Train 2', icon: <MoneyTrainIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Big Bass Bonanza', icon: <FishIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Wolf Gold', icon: <OxIcon className="w-16 h-16 text-gray-400" />, category: 'Outros' },
  { name: 'Razor Shark', icon: <MinesIcon className="w-16 h-16 text-blue-500" />, category: 'Outros' },
  { name: 'Reactoonz', icon: <SpacemanIcon className="w-16 h-16 text-green-400" />, category: 'Outros' },
  { name: 'Starburst', icon: <StarlightPrincessIcon className="w-16 h-16 text-yellow-300" />, category: 'Outros' },
  { name: 'Immortal Romance', icon: <RabbitIcon className="w-16 h-16 text-purple-400" />, category: 'Outros' },
  { name: 'Fire Joker', icon: <OxIcon className="w-16 h-16 text-red-600" />, category: 'Outros' },
  { name: 'Moon Princess', icon: <StarlightPrincessIcon className="w-16 h-16 text-pink-400" />, category: 'Outros' },
  { name: 'Big Bass Splash', icon: <FishIcon className="w-16 h-16 text-teal-400" />, category: 'Outros' },
  { name: 'Mustang Gold', icon: <OxIcon className="w-16 h-16 text-yellow-600" />, category: 'Outros' },
  { name: 'Money Train 3', icon: <MoneyTrainIcon className="w-16 h-16 text-purple-400" />, category: 'Outros' },
  { name: 'Fire in the Hole', icon: <BombIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Mental', icon: <MentalIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Jammin\' Jars', icon: <SugarIcon className="w-16 h-16 text-red-500" />, category: 'Outros' },
  { name: 'Deadwood', icon: <DeadwoodIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Tombstone RIP', icon: <TombstoneRIPIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'San Quentin xWays', icon: <SanQuentinIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Punk Rocker', icon: <PunkRockerIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Reactoonz 2', icon: <Reactoonz2Icon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Gigantoonz', icon: <GigantoonzIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Jammin\' Jars 2', icon: <JamminJars2Icon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Fat Rabbit', icon: <FatRabbitIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Money Train 4', icon: <MoneyTrain4Icon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Chaos Crew', icon: <ChaosCrewIcon className="w-16 h-16" />, category: 'Outros' },
  { name: 'Dork Unit', icon: <DorkUnitIcon className="w-16 h-16" />, category: 'Outros' },
];

// === SubscriptionPage component ===
const SubscriptionPage: React.FC<{ 
    onRequestSubscription: (proofDataUrl: string) => void, 
    onRetrySubscription: () => void,
    user: User 
}> = ({ onRequestSubscription, onRetrySubscription, user }) => {
    const pixKey = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
    const [isKeyCopied, setIsKeyCopied] = useState(false);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);

    const handleCopyKey = () => {
        navigator.clipboard.writeText(pixKey);
        setIsKeyCopied(true);
        setTimeout(() => setIsKeyCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentProof(e.target.files[0]);
        }
    };

    const handleInitiateProofSubmission = () => {
        if (paymentProof) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                    onRequestSubscription(dataUrl);
                }
            };
            reader.readAsDataURL(paymentProof);
        }
    };

    const handleWhatsAppSupport = () => {
        const phoneNumber = "21975431794";
        const message = "Olá sou novo assinante , Quero Informações pode me ajudar?";
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <li className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
            <span className="text-gray-300">{children}</span>
        </li>
    );

    if (user.subscription.status === 'active') {
         return (
             <div className="w-full max-w-md mx-auto animate-fade-in text-center">
                 <Header />
                 <p className="text-green-400/80 -mt-6 text-lg mb-10">Assinatura VIP</p>
                 <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-500/30 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 text-green-300">Plano VIP Ativo</h3>
                        <p className="text-gray-300 mb-6">Você tem acesso total a todos os jogos e funcionalidades.</p>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-left space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-semibold">Status:</span>
                                <span className="text-green-400 font-bold bg-green-900/50 px-3 py-1 rounded-full text-sm">ATIVO</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white font-semibold">Expira em:</span> 
                                <span className="font-bold text-white">{user.subscription.expiryDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-green-500/30 text-left">
                        <h4 className="text-xl font-bold text-white mb-2">Suporte VIP Exclusivo</h4>
                        <p className="text-gray-300 text-sm mb-4">
                            Como assinante VIP, você tem acesso direto à nossa equipe de suporte para tirar dúvidas e receber ajuda.
                        </p>
                        <button
                            onClick={handleWhatsAppSupport}
                            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                            <WhatsAppIcon className="w-6 h-6"/>
                            Contatar Suporte no WhatsApp
                        </button>
                    </div>
                </div>
             </div>
         )
    }

    if (user.subscription.status === 'processing') {
         return (
             <div className="w-full max-w-md mx-auto animate-fade-in text-center">
                 <Header />
                 <p className="text-green-400/80 -mt-6 text-lg mb-10">Assinatura VIP</p>
                 <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-yellow-500/30">
                     <div className="text-center text-yellow-300">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-yellow-400 mx-auto mb-4"></div>
                        <h3 className="text-2xl font-bold mb-4">Pagamento em Processamento</h3>
                        <p>Recebemos seu comprovante. Um administrador irá revisar e liberar seu acesso em breve.</p>
                         <p className="text-sm mt-2 text-gray-400">(Se a aprovação automática estiver ativa, isso levará apenas um instante.)</p>
                    </div>
                 </div>
             </div>
         )
    }

    if (user.subscription.status === 'rejected') {
        return (
            <div className="w-full max-w-md mx-auto animate-fade-in text-center">
                <Header />
                <p className="text-green-400/80 -mt-6 text-lg mb-10">Assinatura VIP</p>
                <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-red-500/50">
                    <div className="text-center text-red-300">
                       <AlertTriangleIcon className="w-16 h-16 mx-auto text-red-400 mb-4"/>
                       <h3 className="text-2xl font-bold mb-4">Pagamento Reprovado</h3>
                       <p className="text-gray-300 mb-6">Seu comprovante foi analisado e reprovado. Verifique os dados do pagamento ou entre em contato com o suporte se acreditar que isso é um erro.</p>
                       <button onClick={onRetrySubscription} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200">
                           Tentar Novamente
                       </button>
                   </div>
                </div>
            </div>
        )
   }
    
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <Header />
            <div className="bg-black/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-purple-500/30">
                <h3 className="text-white text-3xl font-bold mb-2 text-center">Acesso VIP Ilimitado</h3>
                <p className="text-center text-gray-400 mb-6">Junte-se aos vencedores e desbloqueie todo o potencial da nossa IA.</p>

                <div className="my-8 text-center">
                    <span className="text-green-400 text-5xl font-bold">R$ 29,99</span>
                    <span className="text-gray-400 text-lg">/mês</span>
                </div>

                <ul className="space-y-3 text-left my-8">
                    <Feature>Acesso a <b>todos os jogos</b> de cassino</Feature>
                    <Feature>Sinais com <b>maior índice de assertividade</b></Feature>
                    <Feature>Análise de Payout em <b>Tempo Real</b></Feature>
                    <Feature>Modo de <b>Estratégia Manual</b> e Inteligente</Feature>
                    <Feature><b>Nossa IA é excelente em análises,</b> cruzando milhares de dados por segundo para encontrar as melhores oportunidades.</Feature>
                    <Feature>Estratégias validadas pela <b>nossa comunidade</b> de jogadores.</Feature>
                    <Feature>Suporte <b>Prioritário via WhatsApp</b> para membros VIP</Feature>
                </ul>

                <div className="space-y-6 text-left p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                   <div>
                       <p className="font-bold text-lg text-white mb-2">1. Pague com PIX</p>
                       <p className="text-sm text-gray-400 mb-3">Use a chave aleatória abaixo para efetuar o pagamento.</p>
                       <div className="flex items-center gap-2">
                           <input type="text" readOnly value={pixKey} className="w-full bg-gray-800/50 border border-gray-600 text-gray-300 text-sm rounded-lg p-3 truncate"/>
                           <button onClick={handleCopyKey} className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-4 rounded-lg transition-colors">
                               {isKeyCopied ? '✅' : 'Copiar'}
                           </button>
                       </div>
                   </div>
                   
                   <div>
                        <p className="font-bold text-lg text-white mb-2">2. Envie o Comprovante</p>
                        <p className="text-sm text-gray-400 mb-3">Anexe o comprovante de pagamento para validação.</p>
                        <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
                   </div>

                   <button onClick={handleInitiateProofSubmission} disabled={!paymentProof} className="w-full !mt-8 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Liberar Acesso VIP
                   </button>
                </div>
            </div>
        </div>
    );
};

// === Admin Common Components ===
const AdminAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="text-xl font-bold text-purple-300">{title}</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </button>
            <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-purple-500/30">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NumberInput = ({ label, id, min, max, value, onChange }: { label: string; id: keyof PayoutSettings; min?: number; max?: number; value: number; onChange: (id: keyof PayoutSettings, value: string) => void; }) => (
    <div>
        <label htmlFor={id as string} className="block text-white font-medium text-sm mb-2 text-left">{label}</label>
        <input
            type="number"
            id={id as string}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            min={min}
            max={max}
            className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3"
        />
    </div>
);

const PayoutSettingsControl: React.FC<{ 
    tempSettings: PayoutSettings; 
    setTempSettings: React.Dispatch<React.SetStateAction<PayoutSettings>>;
    onSave: () => void;
    onReset: () => void;
    hasChanges: boolean;
    isSaved: boolean;
}> = ({ tempSettings, setTempSettings, onSave, onReset, hasChanges, isSaved }) => {
    const handleNumberChange = (key: keyof PayoutSettings, value: string) => {
        setTempSettings(s => ({ ...s, [key]: Number(value) }));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Início/Limiar Fase Alta %" id="highPhaseMin" min={75} max={99} value={tempSettings.highPhaseMin} onChange={handleNumberChange} />
                <NumberInput label="Pico Máximo Fase Alta %" id="highPhaseMax" min={75} max={99} value={tempSettings.highPhaseMax} onChange={handleNumberChange} />
                <NumberInput label="Vale Mínimo Fase Baixa %" id="lowPhaseMin" min={50} max={74} value={tempSettings.lowPhaseMin} onChange={handleNumberChange} />
                <NumberInput label="Início Fase Baixa %" id="lowPhaseMax" min={50} max={74} value={tempSettings.lowPhaseMax} onChange={handleNumberChange} />
                <NumberInput label="Duração Fase Alta (min)" id="highPhaseDurationMinutes" min={1} value={tempSettings.highPhaseDurationMinutes} onChange={handleNumberChange} />
                <NumberInput label="Duração Fase Baixa (min)" id="lowPhaseDurationMinutes" min={1} value={tempSettings.lowPhaseDurationMinutes} onChange={handleNumberChange} />
                <NumberInput label="Gap Mín. Análise (min)" id="futureAnalysisGapMinutesMin" min={1} value={tempSettings.futureAnalysisGapMinutesMin} onChange={handleNumberChange} />
                <NumberInput label="Gap Máx. Análise (min)" id="futureAnalysisGapMinutesMax" min={1} value={tempSettings.futureAnalysisGapMinutesMax} onChange={handleNumberChange} />
                 <NumberInput label="Cooldown Análise (min)" id="humanSupportCooldownMinutes" value={tempSettings.humanSupportCooldownMinutes} onChange={handleNumberChange} />
            </div>
            <NumberInput label="Cooldown Volatilidade (min)" id="volatilityCooldownMinutes" value={tempSettings.volatilityCooldownMinutes} onChange={handleNumberChange} />
            <div className="flex gap-4 pt-4">
                <button
                    onClick={onReset}
                    disabled={!hasChanges}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Redefinir
                </button>
                <button
                    onClick={onSave}
                    disabled={!hasChanges || isSaved}
                    className={`w-full flex items-center justify-center gap-2 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSaved
                        ? 'bg-green-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isSaved ? (
                        <>
                            <CheckIcon className="w-5 h-5" />
                            Salvo com Sucesso!
                        </>
                    ) : 'Salvar Payouts'}
                </button>
            </div>
        </div>
    );
};

// === SettingsPage (New) ===
const SettingsPage: React.FC<{
    autoApprove: boolean;
    setAutoApprove: (value: boolean) => void;
    systemSettings: SystemSettings;
    setSystemSettings: (settings: SystemSettings) => void;
    payoutSettings: PayoutSettings;
    setPayoutSettings: (settings: PayoutSettings) => void;
    setIsHistoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    addActivityLog: (type: ActivityLog['type'], message: string) => void;
}> = ({ autoApprove, setAutoApprove, systemSettings, setSystemSettings, payoutSettings, setPayoutSettings, setIsHistoryModalOpen, addActivityLog }) => {
    
    const [tempAnnouncement, setTempAnnouncement] = useState(systemSettings.announcement);
    const [isAnnouncementSaved, setIsAnnouncementSaved] = useState(false);
    
    const [tempPayoutSettings, setTempPayoutSettings] = useState<PayoutSettings>(payoutSettings);
    const [isPayoutSaved, setIsPayoutSaved] = useState(false);

    useEffect(() => {
        setTempPayoutSettings(payoutSettings);
    }, [payoutSettings]);

    const hasPayoutChanges = useMemo(() => {
        return JSON.stringify(payoutSettings) !== JSON.stringify(tempPayoutSettings);
    }, [payoutSettings, tempPayoutSettings]);

    const handleSavePayouts = () => {
        setPayoutSettings(tempPayoutSettings);
        setIsPayoutSaved(true);
        addActivityLog('admin', 'Configurações de Payout foram salvas.');
        setTimeout(() => setIsPayoutSaved(false), 2000);
    };

    const handleResetPayouts = () => {
        setTempPayoutSettings(payoutSettings);
    };

    const handleSaveSettings = () => {
        setSystemSettings({ announcement: tempAnnouncement });
        setIsAnnouncementSaved(true);
        addActivityLog('admin', 'Anúncio global foi atualizado.');
        setTimeout(() => setIsAnnouncementSaved(false), 2000);
    };

    const handleToggleAutoApprove = () => {
        const newState = !autoApprove;
        setAutoApprove(newState);
        addActivityLog('admin', `Aprovação automática foi ${newState ? 'ativada' : 'desativada'}.`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in text-center">
            <Header />
            <p className="text-green-400/80 -mt-6 text-lg mb-10">Ajustes do Sistema</p>
            <div className="space-y-8">
                <AdminAccordion title="Configurações de Payout" defaultOpen>
                     <PayoutSettingsControl 
                        tempSettings={tempPayoutSettings} 
                        setTempSettings={setTempPayoutSettings} 
                        onSave={handleSavePayouts}
                        onReset={handleResetPayouts}
                        hasChanges={hasPayoutChanges}
                        isSaved={isPayoutSaved}
                    />
                </AdminAccordion>

                 <AdminAccordion title="Configurações Gerais">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg">
                            <div>
                                <p className="font-bold text-white text-left">Aprovação Automática</p>
                                <p className="text-xs text-gray-400 text-left">Aprovar novas assinaturas instantaneamente.</p>
                            </div>
                            <label className="switch relative inline-block w-14 h-8">
                                <input type="checkbox" checked={autoApprove} onChange={handleToggleAutoApprove} className="opacity-0 w-0 h-0 peer" />
                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-700 rounded-full transition-all peer-checked:bg-green-500 before:absolute before:h-6 before:w-6 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                            </label>
                        </div>
                        <div>
                             <label className="block text-white font-medium text-sm mb-2 text-left">Anúncio Global (deixe em branco para desativar)</label>
                             <textarea 
                                value={tempAnnouncement}
                                onChange={(e) => setTempAnnouncement(e.target.value)}
                                placeholder="Ex: Manutenção programada para as 23h."
                                className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                                rows={2}
                            />
                            <button
                                onClick={handleSaveSettings}
                                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {isAnnouncementSaved ? 'Salvo!' : 'Salvar Configurações'}
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="w-full bg-cyan-600/50 hover:bg-cyan-500/60 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <HistoryIcon className="w-5 h-5"/>
                            Ver Histórico de Aprovações
                        </button>
                    </div>
                 </AdminAccordion>
            </div>
        </div>
    );
};


// === AdminPage (Refactored) ===
const AdminPage: React.FC<{ 
    allUsers: User[], 
    managedGames: ManagedGame[],
    setManagedGames: (games: ManagedGame[]) => void,
    autoApprovingUsers: AutoApprovingUser[],
    handleApprove: (email: string) => void,
    handleDisapprove: (email: string) => void,
    setIsStatsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    activityLog: ActivityLog[],
    addActivityLog: (type: ActivityLog['type'], message: string) => void;
    highPayoutGamesCount: number;
    lowPayoutGamesCount: number;
    approvalHistory: ApprovalRecord[];
}> = ({ allUsers, managedGames, setManagedGames, autoApprovingUsers, handleApprove, handleDisapprove, setIsStatsModalOpen, activityLog, addActivityLog, highPayoutGamesCount, lowPayoutGamesCount, approvalHistory }) => {
    
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [reportPeriod, setReportPeriod] = useState<'day' | 'month' | 'year' | 'all'>('day');

    const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
    
    const pendingUsers = filteredUsers.filter(u => u.subscription.status === 'processing' && u.role !== 'admin' && !autoApprovingUsers.some(au => au.email === u.email));
    const activeUsers = filteredUsers.filter(u => u.subscription.status === 'active');

    const handleToggleGame = (gameName: string) => {
        let gameToggled: ManagedGame | undefined;
        const updatedGames = managedGames.map(game => {
            if (game.name === gameName) {
                gameToggled = { ...game, isActive: !game.isActive };
                return gameToggled;
            }
            return game;
        });

        if (gameToggled) {
            setManagedGames(updatedGames);
            addActivityLog('admin', `O jogo '${gameToggled.name}' foi ${gameToggled.isActive ? 'ativado' : 'desativado'}.`);
        }
    };
    
    const groupedGames = managedGames.reduce<Record<string, ManagedGame[]>>((acc, game) => {
        const category = game.category || 'Outros';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(game);
        return acc;
      }, {});
    
    const activeGamesCount = managedGames.filter(g => g.isActive).length;
    const totalGamesCount = managedGames.length;
    const activePercentage = totalGamesCount > 0 ? (activeGamesCount / totalGamesCount) * 100 : 0;

    const todaysProfit = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return approvalHistory
            .filter(rec => new Date(rec.approvedAt).getTime() >= today.getTime())
            .reduce((sum, rec) => sum + rec.amount, 0);
    }, [approvalHistory]);

    const downloadCSV = (data: ApprovalRecord[], filename: string) => {
        const header = "Data Aprovação,Nome do Usuário,Email do Usuário,Tipo de Aprovação,Valor (R$)\n";
        const csvContent = data.map(rec => 
            [
                new Date(rec.approvedAt).toLocaleString('pt-BR'),
                `"${rec.userName}"`,
                rec.userEmail,
                rec.approvalType,
                rec.amount.toFixed(2).replace('.', ',')
            ].join(',')
        ).join('\n');

        const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleGenerateReport = () => {
        const now = new Date();
        const filteredData = approvalHistory.filter(rec => {
            const recDate = new Date(rec.approvedAt);
            switch(reportPeriod) {
                case 'day':
                    return recDate.toDateString() === now.toDateString();
                case 'month':
                    return recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear();
                case 'year':
                    return recDate.getFullYear() === now.getFullYear();
                case 'all':
                default:
                    return true;
            }
        });
        const filename = `relatorio_pagamentos_${reportPeriod}_${now.toISOString().split('T')[0]}.csv`;
        downloadCSV(filteredData, filename);
        addActivityLog('admin', `Relatório de pagamentos (${reportPeriod}) foi gerado.`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in text-center">
            <Header />
            <p className="text-green-400/80 -mt-6 text-lg mb-10">Painel Administrativo</p>
            <div className="space-y-8">
                 <AdminAccordion title="Dashboard e Estatísticas" defaultOpen>
                    <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="w-full bg-indigo-600/50 hover:bg-indigo-500/60 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <BarChartIcon className="w-5 h-5" />
                        Abrir Dashboard
                    </button>
                 </AdminAccordion>
                 
                 <AdminAccordion title="Relatórios de Pagamento">
                    <div className="space-y-6">
                        <div className="bg-green-900/40 p-6 rounded-lg border border-green-500/50 text-center">
                            <p className="text-sm text-green-200 uppercase tracking-wider">Lucro de Hoje</p>
                            <p className="text-5xl font-bold text-white mt-1">
                                R$ {todaysProfit.toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-lg font-bold text-left text-green-400 mb-2">Gerar Relatórios</h4>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select 
                                    value={reportPeriod}
                                    onChange={(e) => setReportPeriod(e.target.value as any)}
                                    className="flex-grow bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3"
                                >
                                    <option value="day">Hoje</option>
                                    <option value="month">Este Mês</option>
                                    <option value="year">Este Ano</option>
                                    <option value="all">Completo</option>
                                </select>
                                <button
                                    onClick={handleGenerateReport}
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Baixar Relatório (.csv)
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-left text-green-400 mb-2">Pagamentos Aprovados</h4>
                            {approvalHistory.length > 0 ? (
                                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                                    {[...approvalHistory].reverse().map((rec, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-gray-900/30 rounded-lg">
                                            <div className="text-left">
                                                <p className="font-bold text-white">{rec.userName}</p>
                                                <p className="text-sm text-gray-400">{rec.userEmail}</p>
                                                <p className="text-xs text-gray-500">{new Date(rec.approvedAt).toLocaleString('pt-BR')}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 <span className="font-bold text-green-400">R$ {rec.amount.toFixed(2).replace('.', ',')}</span>
                                                 <a
                                                    href={rec.paymentProofDataUrl}
                                                    download={`comprovante_${rec.userEmail}_${new Date(rec.approvedAt).toISOString()}.png`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                                                >
                                                    Baixar Comprovante
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">Nenhum pagamento aprovado ainda.</p>
                            )}
                        </div>
                    </div>
                </AdminAccordion>

                 <AdminAccordion title="Status dos Payouts em Tempo Real">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-900/40 p-4 rounded-lg flex items-center gap-4 border border-green-500/50">
                            <div className="text-green-400">
                                <TrendingUpIcon className="w-8 h-8"/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">Jogos em Alta</p>
                                <p className="text-2xl font-bold text-white">{highPayoutGamesCount}</p>
                            </div>
                        </div>
                        <div className="bg-red-900/40 p-4 rounded-lg flex items-center gap-4 border border-red-500/50">
                            <div className="text-red-400">
                                <TrendingDownIcon className="w-8 h-8"/>
                            </div>
                            <div>
                                <p className="text-sm text-gray-300">Jogos em Baixa</p>
                                <p className="text-2xl font-bold text-white">{lowPayoutGamesCount}</p>
                            </div>
                        </div>
                    </div>
                </AdminAccordion>
                 
                 <AdminAccordion title="Log de Atividades em Tempo Real">
                    {activityLog.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                            {[...activityLog].reverse().map((log, index) => (
                                <div key={index} className="flex items-start gap-3 p-2 bg-gray-900/30 rounded-lg">
                                    <div className="mt-1 flex-shrink-0">
                                        {log.type === 'user' && <ProfileIcon className="w-5 h-5 text-sky-400"/>}
                                        {log.type === 'signal' && <GeneratorIcon className="w-5 h-5 text-green-400"/>}
                                        {log.type === 'subscription' && <SubscriptionIcon className="w-5 h-5 text-yellow-400"/>}
                                        {log.type === 'admin' && <AdminIcon className="w-5 h-5 text-purple-400"/>}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm text-left">{log.message}</p>
                                        <p className="text-xs text-gray-500 text-left">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">Nenhuma atividade registrada ainda.</p>
                    )}
                </AdminAccordion>
                
                 <AdminAccordion title="Gerenciamento de Usuários">
                    <div className="mb-4">
                         <input
                            type="text"
                            placeholder="🔎 Pesquisar por nome ou email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-bold text-yellow-300 mb-2 text-left">Aprovações Pendentes</h4>
                        {pendingUsers.length > 0 ? (
                            <div className="space-y-3">
                                {pendingUsers.map(user => (
                                    <div key={user.email} className="flex flex-col md:flex-row items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                        <div className="text-left mb-2 md:mb-0">
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleDisapprove(user.email)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors">
                                                Reprovar
                                            </button>
                                            <button onClick={() => handleApprove(user.email)} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors">
                                                Aprovar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-left">Nenhum pagamento pendente.</p>
                        )}
                    </div>
                    <div className="mt-6">
                        <h4 className="text-lg font-bold text-green-300 mb-2 text-left">Usuários Ativos</h4>
                         {activeUsers.length > 0 ? (
                            <div className="space-y-3">
                                {activeUsers.map(user => (
                                    <div key={user.email} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg">
                                        <div className="text-left">
                                            <p className="font-bold text-white">{user.name}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-green-400">VIP até {user.subscription.expiryDate}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm text-left">Nenhum usuário ativo encontrado.</p>
                        )}
                    </div>
                </AdminAccordion>

                 <AdminAccordion title="Gerenciamento de Jogos">
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between items-center text-white font-semibold">
                            <span>Status dos Jogos</span>
                            <span>{activeGamesCount} / {totalGamesCount} Ativos</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 border border-gray-600">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${activePercentage}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {Object.entries(groupedGames).map(([category, games]) => (
                            <div key={category}>
                                <h4 className="text-lg font-bold text-left text-green-400 mb-2">{category}</h4>
                                <div className="space-y-2">
                                    {games.map(game => (
                                        <div key={game.name} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg">
                                            <span className="text-base text-white truncate">{game.name}</span>
                                            <label className="switch relative inline-block w-14 h-8">
                                                <input
                                                    type="checkbox"
                                                    checked={game.isActive}
                                                    onChange={() => handleToggleGame(game.name)}
                                                    className="opacity-0 w-0 h-0 peer"
                                                />
                                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-700 rounded-full transition-all peer-checked:bg-green-500 before:absolute before:h-6 before:w-6 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </AdminAccordion>
            </div>
        </div>
    );
};

// === LoginPage Component ===
const LoginPage: React.FC<{
    onLogin: (email: string, password: string, name?: string) => void;
    isLoading: boolean;
    error: string | null;
}> = ({ onLogin, isLoading, error }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        if (mode === 'register') {
            if (!email || !password || !name) return;
            onLogin(email, password, name);
        } else {
            if (!email || !password) return;
            onLogin(email, password);
        }
    };
    
    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
    };

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
             <Header />
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/30">
                <h2 className="text-3xl font-bold text-center text-white mb-2">
                     {mode === 'login' ? 'Acesse sua Conta' : 'Crie sua Conta'}
                </h2>
                <p className="text-center text-gray-400 mb-8">
                    {mode === 'login' ? 'Digite seu e-mail e senha para entrar.' : 'Preencha os dados para se cadastrar.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                     {mode === 'register' && (
                        <div className="animate-fade-in">
                            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Nome Completo</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                required
                                disabled={isLoading}
                                className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            disabled={isLoading}
                            className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white mb-2">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            className="w-full bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500/70 text-red-300 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-6 h-6 border-4 border-t-transparent border-black rounded-full animate-spin"></div>
                                <span>PROCESSANDO...</span>
                            </>
                        ) : (
                            mode === 'login' ? 'Entrar' : 'Cadastrar'
                        )}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">
                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={toggleMode} className="font-semibold text-green-400 hover:text-green-300 ml-1">
                        {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};


// === BottomNav component ===
interface BottomNavProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
    user: User | null;
}
const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, user }) => {
    
    const userNavItems = [
        { page: 'generator', label: 'IA', icon: GeneratorIcon },
        { page: 'history', label: 'Histórico', icon: HistoryIcon },
        { page: 'info', label: 'Informações', icon: InfoIconNav },
        { page: 'subscription', label: 'Assinatura', icon: SubscriptionIcon },
        { page: 'profile', label: 'Perfil', icon: ProfileIcon },
    ];

    const adminNavItems = [
        { page: 'admin', label: 'Admin', icon: AdminIcon },
        { page: 'settings', label: 'Ajustes', icon: SlidersIcon },
        { page: 'info', label: 'Informações', icon: InfoIconNav },
        { page: 'profile', label: 'Perfil', icon: ProfileIcon },
    ];

    const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-lg border-t border-purple-500/30 z-50">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page as Page)}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-20 ${
                            currentPage === item.page ? 'text-green-400' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-7 h-7" />
                        <span className="text-xs font-bold">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

const DURATION_SEQUENCE = [15, 25, 35];

const getNextDurationState = (currentState: PayoutState): { newIndex: number; newDirection: 'forward' | 'backward'; newDuration: number } => {
    let newIndex = currentState.durationIndex;
    let newDirection = currentState.durationDirection;

    if (newDirection === 'forward') {
        newIndex++;
        if (newIndex >= DURATION_SEQUENCE.length) {
            newIndex = DURATION_SEQUENCE.length - 2; // Go to 25 from 35 (index 1)
            newDirection = 'backward';
        }
    } else { // backward
        newIndex--;
        if (newIndex < 0) {
            newIndex = 1; // Go to 25 from 15 (index 1)
            newDirection = 'forward';
        }
    }

    const newDuration = DURATION_SEQUENCE[newIndex];
    return { newIndex, newDirection, newDuration };
};

const StatCard = ({ icon, title, value }: { icon: React.ReactElement<any>; title: string; value: string | number }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg flex items-center gap-4 border border-purple-500/30">
        <div className="text-indigo-400">
            {React.cloneElement(icon, { className: "w-10 h-10" })}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const getExpiryTime = (signal: GeneratedSignal, generatedAt: number): number => {
    const timeRange = signal.payingTimeSuggestion;
    if (!timeRange || !timeRange.includes(' - ') || timeRange.toLowerCase().includes('n/a')) return 0;

    try {
        const endTimeString = timeRange.split(' - ')[1];
        const [hours, minutes] = endTimeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        
        const expiryDate = new Date(generatedAt); // Base on generation time for accuracy across days
        expiryDate.setHours(hours, minutes, 0, 0);

        // If the calculated expiry time is earlier than when it was generated,
        // it must be for the next day (e.g., generated at 23:55, expires at 00:10).
        if (expiryDate.getTime() < generatedAt) {
            expiryDate.setDate(expiryDate.getDate() + 1);
        }
        return expiryDate.getTime();
    } catch (e) {
        console.error("Error parsing signal expiry time:", e);
        return 0;
    }
};

// --- DEVELOPMENT ONLY MOCK USERS ---
const developerAdminUser: User = {
  name: 'Leonardo Dantas',
  email: 'dantasleo643@gmail.com',
  password: '265664',
  role: 'admin',
  subscription: {
    status: 'active',
    expiryDate: '31/12/2099',
  },
  favoriteGames: ['Fortune Tiger', 'Mines'],
  notificationSettings: {
    enabled: true,
    newSignal: true,
    signalExpiration: true,
  },
  casinoPlatformName: 'EstrelaBet',
  casinoPlatformLink: 'https://estrelabet.com',
};

const developerVipUser: User = {
  name: 'Usuário VIP',
  email: 'vip@example.com',
  password: 'vip',
  role: 'user',
  subscription: {
    status: 'active',
    expiryDate: '30/06/2025',
  },
  favoriteGames: ['Aviator', 'Spaceman', 'Mines'],
  notificationSettings: {
    enabled: true,
    newSignal: true,
    signalExpiration: false,
  },
  casinoPlatformName: 'Blaze',
  casinoPlatformLink: 'https://blaze.com',
};

const mockInitialUsers: User[] = [
    developerAdminUser,
    developerVipUser,
    {
        name: 'Pendente Aprovação',
        email: 'pending@example.com',
        password: 'pending',
        role: 'user',
        subscription: {
            status: 'processing',
            expiryDate: null,
            pendingProofDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==', // 1x1 black pixel
        },
        favoriteGames: [],
        notificationSettings: { enabled: false, newSignal: false, signalExpiration: false },
        casinoPlatformName: '',
        casinoPlatformLink: '',
    },
    {
        name: 'Usuário Rejeitado',
        email: 'rejected@example.com',
        password: 'rejected',
        role: 'user',
        subscription: { status: 'rejected', expiryDate: null },
        favoriteGames: [],
        notificationSettings: { enabled: false, newSignal: false, signalExpiration: false },
        casinoPlatformName: '',
        casinoPlatformLink: '',
    },
    {
        name: 'Usuário Inativo',
        email: 'inactive@example.com',
        password: 'inactive',
        role: 'user',
        subscription: { status: 'inactive', expiryDate: null },
        favoriteGames: [],
        notificationSettings: { enabled: false, newSignal: false, signalExpiration: false },
        casinoPlatformName: '',
        casinoPlatformLink: '',
    },
];

const mockApprovalHistory: ApprovalRecord[] = [
    {
        userName: 'Usuário VIP',
        userEmail: 'vip@example.com',
        approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        approvalType: 'manual',
        paymentProofDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        amount: 29.99
    },
    {
        userName: 'Pendente Aprovação',
        userEmail: 'pending@example.com',
        approvedAt: new Date(Date.now() - 28 * 60 * 60 * 1000), // 28 hours ago
        approvalType: 'automatic',
        paymentProofDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==',
        amount: 29.99
    }
];


// === MAIN APP component ===
const App: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<{ name: string; payout?: number } | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('generator');
    const [signalHistory, setSignalHistory] = useState<HistorySignal[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>(mockInitialUsers); // For admin simulation
    const [managedGames, setManagedGames] = useState<ManagedGame[]>([]);
    const [autoApprovingUsers, setAutoApprovingUsers] = useState<AutoApprovingUser[]>([]);
    const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>(mockApprovalHistory);
    const [signalRequestHistory, setSignalRequestHistory] = useState<SignalRequestRecord>({});
    const [systemSettings, setSystemSettings] = useState<SystemSettings>({ announcement: '' });
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [revisitedGame, setRevisitedGame] = useState<string | null>(null);
    const [warnedGames, setWarnedGames] = useState<Record<string, { nextPhaseDurationMinutes?: number }>>({});
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const notificationTimeoutsRef = useRef<Record<string, number>>({});
    const [generatingGame, setGeneratingGame] = useState<{ name: string; startTime: number } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // === PERSISTENCE LOGIC ===
    const APP_PREFIX = 'baseExCasino_';
    const LOCAL_KEYS = {
        ACTIVE_SIGNALS: `${APP_PREFIX}activeSignals`,
        CHANGING_GAME: `${APP_PREFIX}changingGame`,
    };

    const [activeSignals, setActiveSignals] = useState<Record<string, ActiveSignal>>(() => {
        try {
            const stored = localStorage.getItem(LOCAL_KEYS.ACTIVE_SIGNALS);
            if (!stored) return {};

            const parsed = JSON.parse(stored);
            const now = Date.now();
            const validSignals: Record<string, ActiveSignal> = {};
            
            for (const gameName in parsed) {
                const signalData = parsed[gameName];
                if (signalData && signalData.signal && typeof signalData.generatedAt === 'number') {
                    const expiryTimestamp = getExpiryTime(signalData.signal, signalData.generatedAt);
                    if (expiryTimestamp > 0 && now < expiryTimestamp) {
                        validSignals[gameName] = signalData;
                    }
                }
            }
            return validSignals;
        } catch (e) {
            console.error("Failed to load active signals from localStorage:", e);
            localStorage.removeItem(LOCAL_KEYS.ACTIVE_SIGNALS);
            return {};
        }
    });

    const [changingGame, setChangingGame] = useState<{ name: string; nextPhase: 'high' | 'low'; durationMinutes: number; endTime: number } | null>(() => {
        try {
            const stored = localStorage.getItem(LOCAL_KEYS.CHANGING_GAME);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.endTime > Date.now()) {
                    return parsed;
                }
            }
        } catch (e) {
             console.error("Failed to load changing game state:", e);
        }
        return null;
    });

    useEffect(() => {
        try {
            if (changingGame) {
                localStorage.setItem(LOCAL_KEYS.CHANGING_GAME, JSON.stringify(changingGame));
            } else {
                localStorage.removeItem(LOCAL_KEYS.CHANGING_GAME);
            }
        } catch (e) {
             console.error("Error saving changing game state:", e);
        }
    }, [changingGame]);

    
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [autoApprove, setAutoApproveState] = useState<boolean>(false);
    const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
        highPhaseMin: 75, highPhaseMax: 90, lowPhaseMin: 58, lowPhaseMax: 74,
        highPhaseDurationMinutes: 35, lowPhaseDurationMinutes: 33, volatilityCooldownMinutes: 2,
        humanSupportCooldownMinutes: 35, futureAnalysisGapMinutesMin: 70, futureAnalysisGapMinutesMax: 70,
    });
    const [gamePayoutStates, setGamePayoutStates] = useState<GamePayoutStates>({});


    // Service Worker Registration
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        setSwRegistration(registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }, []);
    
    // Initial Data Setup (replaces Supabase fetch)
    useEffect(() => {
        // Initialize managed games from the master list
        const initialManagedGames = allGames.map(g => ({ ...g, isActive: true }));
        setManagedGames(initialManagedGames);

        // Initialize dynamic payout states for each game
        const initialPayoutStates: GamePayoutStates = {};
        const settings = payoutSettings;
        for (const game of allGames) {
            const phase = Math.random() > 0.5 ? 'high' : 'low';
            const durationMinutes = phase === 'high' ? settings.highPhaseDurationMinutes : settings.lowPhaseDurationMinutes;
            const startTime = Date.now() - Math.floor(Math.random() * durationMinutes * 60 * 1000);
            const endTime = startTime + durationMinutes * 60 * 1000;
            const totalDuration = endTime - startTime;
            const elapsedTime = Date.now() - startTime;
            const progress = totalDuration > 0 ? Math.min(1, elapsedTime / totalDuration) : 1;
            
            let payout;
            if (phase === 'high') {
                payout = settings.highPhaseMax - (settings.highPhaseMax - settings.highPhaseMin) * progress;
            } else {
                payout = settings.lowPhaseMin + (settings.lowPhaseMax - settings.lowPhaseMin) * progress;
            }

            initialPayoutStates[game.name] = {
                payout: Math.round(payout),
                phase,
                phaseStartTime: startTime,
                phaseEndTime: endTime,
                volatilityCooldownEnd: null,
                humanSupportCooldownEnd: null,
                durationMinutes: durationMinutes,
                durationIndex: DURATION_SEQUENCE.indexOf(durationMinutes) !== -1 ? DURATION_SEQUENCE.indexOf(durationMinutes) : 1,
                durationDirection: 'forward',
            };
        }
        setGamePayoutStates(initialPayoutStates);

    }, []); // Runs only once on mount


    const gamePayouts = useMemo(() => {
        return Object.entries(gamePayoutStates).reduce((acc, [name, state]) => {
            if(state) acc[name] = state.payout;
            return acc;
        }, {} as Record<string, number>);
    }, [gamePayoutStates]);

    const handleBackToSelection = () => {
        setSelectedGame(null);
        setGenerationError(null);
        setRevisitedGame(null);
    };

    const addActivityLog = useCallback((type: ActivityLog['type'], message: string) => {
        setActivityLog(prev => [...prev, { type, message, timestamp: Date.now() }].slice(-50));
    }, []);

    // Effect for Automatic Subscription Approval
    useEffect(() => {
        if (!autoApprove) {
            return;
        }

        const usersToAutoApprove = allUsers.filter(u =>
            u.subscription.status === 'processing' &&
            !autoApprovingUsers.some(au => au.email === u.email)
        );

        if (usersToAutoApprove.length === 0) {
            return;
        }

        const newAutoApprovingUsers: AutoApprovingUser[] = usersToAutoApprove.map(u => ({
            email: u.email,
            name: u.name,
            startTime: Date.now(),
        }));

        setAutoApprovingUsers(prev => [...prev, ...newAutoApprovingUsers]);

        newAutoApprovingUsers.forEach(userToApprove => {
            const approvalDelay = 2500; // Simulate a 2.5 second process

            setTimeout(() => {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);

                const newSubscription = {
                    status: 'active' as const,
                    expiryDate: expiryDate.toLocaleDateString('pt-BR'),
                };

                let approvedUser: User | undefined;
                setAllUsers(prevUsers => prevUsers.map(u => {
                    if (u.email === userToApprove.email) {
                        approvedUser = { ...u, subscription: newSubscription };
                        return approvedUser;
                    }
                    return u;
                }));
                
                // If the current user is the one being approved, update their state too
                setUser(currentUser => {
                    if (currentUser && currentUser.email === userToApprove.email) {
                        return { ...currentUser, subscription: newSubscription };
                    }
                    return currentUser;
                });

                const userRecord = allUsers.find(u => u.email === userToApprove.email);
                if (userRecord?.subscription.pendingProofDataUrl) {
                    setApprovalHistory(prev => [...prev, {
                        userName: userToApprove.name,
                        userEmail: userToApprove.email,
                        approvedAt: new Date(),
                        approvalType: 'automatic',
                        paymentProofDataUrl: userRecord.subscription.pendingProofDataUrl,
                        amount: 29.99
                    }]);
                }

                if (approvedUser) {
                    addActivityLog('subscription', `Assinatura de '${approvedUser.name}' foi aprovada AUTOMATICAMENTE.`);
                }

                setAutoApprovingUsers(prev => prev.filter(au => au.email !== userToApprove.email));

            }, approvalDelay);
        });
    }, [allUsers, autoApprove, autoApprovingUsers, addActivityLog]);

    const handleSignalGenerated = useCallback((newSignal: GeneratedSignal, gameName: string) => {
        if(user) addActivityLog('signal', `Sinal gerado para '${gameName}' pelo usuário '${user.name}'.`);
        const now = Date.now();
        const currentState = gamePayoutStates[gameName];
        
        const calculatedFutureAnalyses: FutureAnalysis[] = [];
        
        const parseTimeToTimestamp = (timeStr: string): number | null => {
            try {
                const now = new Date();
                const [hours, minutes] = timeStr.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) return null;
                
                const date = new Date();
                date.setHours(hours, minutes, 0, 0);

                if (now.getTime() > date.getTime() && (now.getTime() - date.getTime()) > 12 * 60 * 60 * 1000) {
                    date.setDate(date.getDate() + 1);
                }
                return date.getTime();
            } catch (e) {
                console.error("Error parsing time:", e);
                return null;
            }
        };

        const timeRange = newSignal.payingTimeSuggestion;
        const signalEndTimeStr = timeRange?.includes(' - ') ? timeRange.split(' - ')[1].trim() : null;
        const signalEndTimestamp = signalEndTimeStr ? parseTimeToTimestamp(signalEndTimeStr) : null;
        
        if (currentState && signalEndTimestamp) {
            const initialGapMinutes = 20;
            let lastEndTime = signalEndTimestamp + initialGapMinutes * 60 * 1000;
            
            const phaseAtSignalEnd = signalEndTimestamp <= currentState.phaseEndTime 
                ? currentState.phase 
                : (currentState.phase === 'high' ? 'low' : 'high');
            
            let nextPhase = phaseAtSignalEnd === 'high' ? 'low' : 'high';
            
            for (let i = 0; i < 4; i++) {
                const durationMinutes = nextPhase === 'high' 
                    ? payoutSettings.highPhaseDurationMinutes 
                    : payoutSettings.lowPhaseDurationMinutes;

                const analysisType = nextPhase === 'high' ? 'Pico de Pagamento' : 'Queda de Pagamento';
                const predictedPayout = nextPhase === 'high'
                     ? Math.floor(Math.random() * (payoutSettings.highPhaseMax - payoutSettings.highPhaseMin + 1)) + payoutSettings.highPhaseMin
                    : Math.floor(Math.random() * (payoutSettings.lowPhaseMax - payoutSettings.lowPhaseMin + 1)) + payoutSettings.lowPhaseMin;
                
                const startTime = new Date(lastEndTime);
                const endTime = new Date(lastEndTime + durationMinutes * 60 * 1000);
                const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                calculatedFutureAnalyses.push({
                    timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`,
                    analysisType,
                    predictedPayout,
                });
                
                const gapMinutes = Math.floor(Math.random() * (payoutSettings.futureAnalysisGapMinutesMax - payoutSettings.futureAnalysisGapMinutesMin + 1)) + payoutSettings.futureAnalysisGapMinutesMin;
                lastEndTime = endTime.getTime() + gapMinutes * 60 * 1000;
                nextPhase = nextPhase === 'high' ? 'low' : 'high';
            }
        }
        
        const isLowPayout = newSignal.confidenceIndex < payoutSettings.highPhaseMin;
        
        const signalWithAnalyses: GeneratedSignal = {
            ...newSignal,
            futureAnalyses: calculatedFutureAnalyses.length > 0 ? calculatedFutureAnalyses : undefined,
        };

        const newActiveSignal: ActiveSignal = { 
            signal: signalWithAnalyses, 
            gameName, 
            generatedAt: now 
        };

        setActiveSignals(prev => {
            const updated = {...prev, [gameName]: newActiveSignal};
            localStorage.setItem(LOCAL_KEYS.ACTIVE_SIGNALS, JSON.stringify(updated));
            return updated;
        });

        const newHistoryEntry: HistorySignal = {
            ...signalWithAnalyses,
            gameName: gameName,
            generatedAt: new Date(now).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            generatedAtTimestamp: now,
            status: 'valid'
        };
        
        setSignalHistory(prev => [newHistoryEntry, ...prev]);

        // Handle expiration notification
        if (notificationTimeoutsRef.current[gameName]) {
            clearTimeout(notificationTimeoutsRef.current[gameName]);
        }

        if (user?.notificationSettings.enabled && user.notificationSettings.signalExpiration && swRegistration && signalEndTimestamp) {
            const NOTIFICATION_LEAD_TIME = 2 * 60 * 1000; // 2 minutes
            const notificationTime = signalEndTimestamp - NOTIFICATION_LEAD_TIME;
            
            if (notificationTime > Date.now()) {
                const timeoutId = window.setTimeout(() => {
                    if (user?.notificationSettings.enabled && user.notificationSettings.signalExpiration) {
                         swRegistration.showNotification('Sinal Expirando!', {
                            body: `Seu sinal para ${gameName} irá expirar em breve.`,
                            icon: '/vite.svg',
                            badge: '/vite.svg',
                            data: { url: '/' }
                        });
                    }
                }, notificationTime - Date.now());
                notificationTimeoutsRef.current[gameName] = timeoutId;
            }
        }
        // Clear any warnings for this game upon successful generation
        setWarnedGames(prev => {
            if (!prev[gameName]) return prev;
            const newWarned = { ...prev };
            delete newWarned[gameName];
            return newWarned;
        });
    }, [user, gamePayoutStates, payoutSettings, swRegistration, addActivityLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let hasChanged = false;
            const newActiveSignals = { ...activeSignals };
            const expiredSignals: number[] = [];

            for (const gameName in newActiveSignals) {
                const signalData = newActiveSignals[gameName];
                const expiryTimestamp = getExpiryTime(signalData.signal, signalData.generatedAt);

                if (expiryTimestamp > 0 && now > expiryTimestamp) {
                    delete newActiveSignals[gameName];
                    hasChanged = true;
                    expiredSignals.push(signalData.generatedAt);
                }
            }

            if (hasChanged) {
                setActiveSignals(newActiveSignals);
                 localStorage.setItem(LOCAL_KEYS.ACTIVE_SIGNALS, JSON.stringify(newActiveSignals));
                 setSignalHistory(prev => prev.map(s => {
                    if (s.status === 'valid' && expiredSignals.includes(s.generatedAtTimestamp)) {
                        return { ...s, status: 'expired' };
                    }
                    return s;
                 }));
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [activeSignals]);


    useEffect(() => {
        const PAYOUT_INTERVAL = 1000; 

        const payoutUpdater = () => {
            setGamePayoutStates(currentStates => {
                const newStates = { ...currentStates };
                const now = Date.now();
                
                Object.keys(newStates).forEach(gameName => {
                    const state = { ...newStates[gameName] };
                    if (now > state.phaseEndTime) {
                        // Switch phase
                        const nextDurationState = getNextDurationState(state);
                        state.phase = state.phase === 'high' ? 'low' : 'high';
                        state.phaseStartTime = state.phaseEndTime;
                        state.durationMinutes = nextDurationState.newDuration;
                        state.phaseEndTime = state.phaseStartTime + state.durationMinutes * 60 * 1000;
                        state.durationIndex = nextDurationState.newIndex;
                        state.durationDirection = nextDurationState.newDirection;
                    }

                    const totalDuration = state.phaseEndTime - state.phaseStartTime;
                    const elapsedTime = now - state.phaseStartTime;
                    const progress = totalDuration > 0 ? Math.min(1, elapsedTime / totalDuration) : 1;
                    
                    let newPayout;
                    if (state.phase === 'high') {
                        newPayout = payoutSettings.highPhaseMax - (payoutSettings.highPhaseMax - payoutSettings.highPhaseMin) * progress;
                    } else {
                        newPayout = payoutSettings.lowPhaseMin + (payoutSettings.lowPhaseMax - payoutSettings.lowPhaseMin) * progress;
                    }
                    state.payout = Math.round(newPayout);
                    
                    const timeLeft = state.phaseEndTime - now;
                    state.isChangingSoon = timeLeft <= 2.5 * 60 * 1000; // 2.5 minutes
                    if(state.isChangingSoon) {
                        state.nextPhase = state.phase === 'high' ? 'low' : 'high';
                        state.nextPhaseDurationMinutes = state.nextPhase === 'high' ? payoutSettings.highPhaseDurationMinutes : payoutSettings.lowPhaseDurationMinutes;
                    } else {
                        state.nextPhase = undefined;
                        state.nextPhaseDurationMinutes = undefined;
                    }

                    newStates[gameName] = state;
                });

                return newStates;
            });
        };

        const interval = setInterval(payoutUpdater, PAYOUT_INTERVAL);
        return () => clearInterval(interval);
    }, [payoutSettings]);

    const handleLogin = async (email: string, password: string, name?: string) => {
        setLoginError(null);
        setIsLoggingIn(true);
    
        try {
            const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
            if (foundUser) { // Login attempt
                if (name) { // User tried to register with an existing email
                    setLoginError("Este email já está cadastrado. Tente fazer login.");
                    setIsLoggingIn(false);
                    return;
                }
                if (foundUser.password === password) {
                    // Tenta fazer login com o Supabase
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) {
                        setLoginError(`Erro ao fazer login: ${error.message}`);
                        setIsLoggingIn(false);
                        return;
                    }
                    setUser(foundUser);
    
                } else {
                    setLoginError("Senha incorreta.");
                }
            } else { // Signup attempt
                if (!name) {
                    setLoginError("Ocorreu um erro. Por favor, forneça seu nome completo para se cadastrar.");
                    setIsLoggingIn(false);
                    return;
                }
    
                // Tenta cadastrar o usuário no Supabase
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                        }
                    }
                });
    
                if (error) {
                    setLoginError(`Erro ao cadastrar usuário: ${error.message}`);
                    setIsLoggingIn(false);
                    return;
                }
    
                const newUser: User = {
                    name: name,
                    email: email.toLowerCase(),
                    password: password,
                    role: 'user',
                    subscription: { status: 'inactive', expiryDate: null },
                    favoriteGames: [],
                    notificationSettings: { enabled: false, newSignal: false, signalExpiration: false },
                    casinoPlatformName: '',
                    casinoPlatformLink: '',
                };
    
                // Insere os dados do usuário na tabela 'users'
                 const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user?.id, // Use o ID do usuário retornado pelo Supabase
                        email: newUser.email,
                        name: newUser.name,
                        password: newUser.password, // TODO: Hash the password before storing it
                    }]);
    
                if (insertError) {
                    setLoginError(`Erro ao inserir dados do usuário no Supabase: ${insertError.message}`);
                    setIsLoggingIn(false);
                    return;
                }
    
                setAllUsers(prev => [...prev, newUser]);
                setUser(newUser);
                addActivityLog('user', `Novo usuário '${newUser.name}' se cadastrou.`);
            }
            setIsLoggingIn(false);
        } catch (error: any) {
            setLoginError(`Ocorreu um erro inesperado: ${error.message}`);
            setIsLoggingIn(false);
        }
    };
    

    const handleLogout = () => {
        setUser(null);
        setSelectedGame(null);
        setActiveSignals({});
        setCurrentPage('generator');
    };

    const handleGameSelect = (gameName: string, payout?: number) => {
        setGenerationError(null);
        const activeSignal = activeSignals[gameName];
        if (activeSignal) {
            setRevisitedGame(gameName);
        } else {
            setRevisitedGame(null);
        }
        setSelectedGame({ name: gameName, payout });
    };

    const handleNavigate = (page: Page) => {
        setSelectedGame(null);
        setCurrentPage(page);
    };

    const onInitiateSignalGeneration = useCallback(async (
        gameName: string,
        options: { customStrategy?: CustomStrategyConfig; isAnalysisOnly?: boolean } = {}
    ) => {
        const startTime = Date.now();
        setGeneratingGame({ name: gameName, startTime });
        setGenerationError(null);

        const MIN_LOADING_TIME = 35000;

        try {
            const apiCallPromise = generateSignal(
                gameName,
                gamePayoutStates[gameName],
                payoutSettings,
                !!options.isAnalysisOnly,
                options.customStrategy,
                signalHistory
            );

            const newSignal = await apiCallPromise;
            
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < MIN_LOADING_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
            }

            handleSignalGenerated(newSignal, gameName);

        } catch (error: any) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < MIN_LOADING_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
            }
            setGenerationError(error.message || 'An unknown error occurred while generating the signal.');
        } finally {
            setGeneratingGame(null);
        }
    }, [gamePayoutStates, payoutSettings, handleSignalGenerated, signalHistory]);

    const onInvalidateSignal = useCallback((gameName: string, reason: 'warning' | 'user_cancellation' | 'profit_finalize' | 'phase_change') => {
        const signalToInvalidate = activeSignals[gameName];
        if (!signalToInvalidate) return;

        if (user) {
            addActivityLog('signal', `Sinal para '${gameName}' invalidado por '${user.name}' (motivo: ${reason}).`);
        }

        setActiveSignals(prev => {
            const updated = { ...prev };
            delete updated[gameName];
             localStorage.setItem(LOCAL_KEYS.ACTIVE_SIGNALS, JSON.stringify(updated));
            return updated;
        });
        
        const newStatus = reason === 'profit_finalize' ? 'finalized' : 'invalid';
        setSignalHistory(prev => prev.map(s => s.generatedAtTimestamp === signalToInvalidate.generatedAt ? { ...s, status: newStatus } : s));
        
        if (reason === 'user_cancellation') {
            setGamePayoutStates(prev => ({ ...prev, [gameName]: { ...prev[gameName], humanSupportCooldownEnd: Date.now() + payoutSettings.humanSupportCooldownMinutes * 60 * 1000 }}));
            handleBackToSelection();
        } else if (reason === 'phase_change') {
            const currentState = gamePayoutStates[gameName];
            if (currentState && currentState.nextPhase) {
                setChangingGame({
                    name: gameName,
                    nextPhase: currentState.nextPhase,
                    durationMinutes: currentState.nextPhaseDurationMinutes ?? 5, // Fallback
                    endTime: currentState.phaseEndTime,
                });
                handleBackToSelection();
            } else {
                handleBackToSelection();
            }
        } else {
             handleBackToSelection();
        }
    }, [user, addActivityLog, payoutSettings, gamePayoutStates, activeSignals]);

    const handleConfirmProfit = useCallback((gameName: string) => {
        if (user) {
            addActivityLog('signal', `Lucro confirmado para o sinal de '${gameName}' pelo usuário '${user.name}'.`);
        }
        setActiveSignals(prev => {
            if (!prev[gameName]) {
                return prev;
            }
            const updatedSignalData = { ...prev[gameName], profitConfirmed: true };
            const updated = { ...prev, [gameName]: updatedSignalData };
            localStorage.setItem(LOCAL_KEYS.ACTIVE_SIGNALS, JSON.stringify(updated));
            return updated;
        });
    }, [user, addActivityLog]);

    const onRegenerateSignal = useCallback(() => {
        if (selectedGame) {
            setActiveSignals(prev => {
                const updated = { ...prev };
                delete updated[selectedGame.name];
                localStorage.setItem(LOCAL_KEYS.ACTIVE_SIGNALS, JSON.stringify(updated));
                return updated;
            });
            onInitiateSignalGeneration(selectedGame.name);
        }
    }, [selectedGame, onInitiateSignalGeneration]);

    const onTriggerVolatility = useCallback((gameName: string) => {
        setGamePayoutStates(prev => ({...prev, [gameName]: {...prev[gameName], volatilityCooldownEnd: Date.now() + payoutSettings.volatilityCooldownMinutes * 60 * 1000 }}));
    }, [payoutSettings.volatilityCooldownMinutes]);

    const handleToggleFavorite = (gameName: string) => {
        if (!user) return;
        const newFavorites = user.favoriteGames.includes(gameName)
            ? user.favoriteGames.filter(g => g !== gameName)
            : [...user.favoriteGames, gameName];
        
        const updatedUser = { ...user, favoriteGames: newFavorites };
        handleSaveProfile(updatedUser);
    };
    
    // FIX: Made function async to match the 'onSave' prop type in ProfilePage, which expects a Promise.
    const handleSaveProfile = async (updatedUser: User) => {
        if (!user) return;
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
    };


    const handleReplayGame = (gameName: string) => {
        handleGameSelect(gameName, gamePayouts[gameName]);
    };
    
    const handleRequestSubscription = (proofDataUrl: string) => {
        if (!user) return;
        const newSubscription = {
            ...user.subscription,
            status: 'processing' as const,
            pendingProofDataUrl: proofDataUrl,
        };
        const updatedUser = { ...user, subscription: newSubscription };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.email === user.email ? updatedUser : u));
        addActivityLog('subscription', `Usuário '${user.name}' solicitou assinatura VIP.`);
    };

    const onRetrySubscription = () => {
        if (!user) return;
        const newSubscription = { ...user.subscription, status: 'inactive' as const };
        const updatedUser = { ...user, subscription: newSubscription };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.email === user.email ? updatedUser : u));
    };
    
    const handleApprove = (email: string) => {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        // FIX: Corrected subscription object type to match User['subscription'].
        // 'status' is now a literal type, and 'pendingProofDataUrl' is omitted.
        const newSubscription = {
            status: 'active' as const,
            expiryDate: expiryDate.toLocaleDateString('pt-BR'),
        };
        
        let approvedUser: User | undefined;
        setAllUsers(prev => prev.map(u => {
            if (u.email === email) {
                approvedUser = { ...u, subscription: newSubscription };
                return approvedUser;
            }
            return u;
        }));

        if (approvedUser) {
            const userToRecord = allUsers.find(u => u.email === email);
            if(userToRecord?.subscription.pendingProofDataUrl) {
                setApprovalHistory(prev => [...prev, {
                    userName: approvedUser!.name,
                    userEmail: approvedUser!.email,
                    approvedAt: new Date(),
                    approvalType: 'manual',
                    paymentProofDataUrl: userToRecord.subscription.pendingProofDataUrl!,
                    amount: 29.99
                }]);
            }
            addActivityLog('admin', `Assinatura de '${approvedUser.name}' foi aprovada.`);
        }
    };

    const handleDisapprove = (email: string) => {
        // FIX: Corrected subscription object type to match User['subscription'].
        // 'status' is a literal type, and 'pendingProofDataUrl' is omitted.
        const newSubscription = { status: 'rejected' as const, expiryDate: null };
        let disapprovedUser: User | undefined;
        setAllUsers(prev => prev.map(u => {
            if(u.email === email) {
                disapprovedUser = { ...u, subscription: newSubscription };
                return disapprovedUser;
            }
            return u;
        }));
        if (disapprovedUser) addActivityLog('admin', `Assinatura de '${disapprovedUser.name}' foi reprovada.`);
    };

    const setManagedGamesState = (games: ManagedGame[]) => {
        setManagedGames(games);
    };

    const highPayoutGamesCount = useMemo(() => Object.values(gamePayoutStates).filter(s => s.phase === 'high' && managedGames.find(g => g.name === Object.keys(gamePayoutStates).find(k => gamePayoutStates[k] === s))?.isActive).length, [gamePayoutStates, managedGames]);
    const lowPayoutGamesCount = useMemo(() => Object.values(gamePayoutStates).filter(s => s.phase === 'low' && managedGames.find(g => g.name === Object.keys(gamePayoutStates).find(k => gamePayoutStates[k] === s))?.isActive).length, [gamePayoutStates, managedGames]);
    const signalsTodayCount = useMemo(() => signalHistory.filter(s => s.status !== 'valid').length, [signalHistory]);
    const finalizedCount = useMemo(() => signalHistory.filter(s => s.status === 'finalized').length, [signalHistory]);
    const invalidCount = useMemo(() => signalHistory.filter(s => s.status === 'invalid').length, [signalHistory]);
    const totalForAssertiveness = finalizedCount + invalidCount;
    const assertiveness = totalForAssertiveness > 0 ? Math.round((finalizedCount / totalForAssertiveness) * 100) : 0;
    const activeUsersCount = useMemo(() => allUsers.filter(u => u.subscription.status === 'active').length, [allUsers]);
    const pendingApprovalsCount = useMemo(() => allUsers.filter(u => u.subscription.status === 'processing' && !autoApprovingUsers.some(au => au.email === u.email)).length, [allUsers, autoApprovingUsers]);

    const renderPage = () => {
        if (!user) {
            return <LoginPage onLogin={handleLogin} isLoading={isLoggingIn} error={loginError} />;
        }

        if (changingGame && changingGame.endTime > Date.now()) {
            return <ChangingPhaseInterstitial gameName={changingGame.name} nextPhase={changingGame.nextPhase} durationMinutes={changingGame.durationMinutes} endTime={changingGame.endTime} onFinish={() => setChangingGame(null)} />;
        }

        const activeSignalForSelectedGame = selectedGame ? activeSignals[selectedGame.name] : null;
        const generatingGameName = generatingGame?.name ?? null;
        const activeSignalGames = Object.entries(activeSignals)
            .filter(([, activeSignal]) => !activeSignal.signal.isLowPayoutSignal)
            .map(([gameName]) => gameName);
        const riskAnalysisGames = Object.entries(activeSignals)
            .filter(([, activeSignal]) => activeSignal.signal.isLowPayoutSignal)
            .map(([gameName]) => gameName);

        if (selectedGame) {
            if (activeSignalForSelectedGame) {
                 return (
                    <SignalDisplay
                        signal={activeSignalForSelectedGame.signal}
                        onBackToSelection={handleBackToSelection}
                        onInvalidateSignal={onInvalidateSignal}
                        isRevisit={revisitedGame === selectedGame.name}
                        gameName={selectedGame.name}
                        generatedAt={activeSignalForSelectedGame.generatedAt}
                        currentPayout={gamePayouts[selectedGame.name]}
                        payoutState={gamePayoutStates[selectedGame.name]}
                        onRegenerateSignal={onRegenerateSignal}
                        onConfirmProfit={handleConfirmProfit}
                        isProfitConfirmed={!!activeSignalForSelectedGame.profitConfirmed}
                    />
                );
            }
            return (
                <SignalGeneratorPage
                    gameName={selectedGame.name}
                    gameIcon={allGames.find(g => g.name === selectedGame.name)?.icon ?? null}
                    payout={gamePayouts[selectedGame.name]}
                    payoutState={gamePayoutStates[selectedGame.name]}
                    onBack={handleBackToSelection}
                    signalRequestHistory={signalRequestHistory}
                    setSignalRequestHistory={setSignalRequestHistory}
                    onTriggerVolatility={onTriggerVolatility}
                    volatilityCooldownEnd={gamePayoutStates[selectedGame.name]?.volatilityCooldownEnd ?? null}
                    humanSupportCooldownEnd={gamePayoutStates[selectedGame.name]?.humanSupportCooldownEnd ?? null}
                    payoutSettings={payoutSettings}
                    isRevisitAfterWarning={!!warnedGames[selectedGame.name]}
                    nextPhaseDurationMinutes={warnedGames[selectedGame.name]?.nextPhaseDurationMinutes}
                    isGenerating={generatingGame?.name === selectedGame.name}
                    generationStartTime={generatingGame?.startTime}
                    generationError={generationError}
                    onInitiateSignalGeneration={onInitiateSignalGeneration}
                    onClearGenerationError={() => setGenerationError(null)}
                    signalHistory={signalHistory}
                />
            );
        }

        switch (currentPage) {
            case 'generator':
                return <GameSelection games={managedGames} onGameSelect={handleGameSelect} user={user} onNavigate={handleNavigate} gamePayouts={gamePayouts} gamePayoutStates={gamePayoutStates} payoutSettings={payoutSettings} generatingGameName={generatingGameName} onToggleFavorite={handleToggleFavorite} activeSignalGames={activeSignalGames} riskAnalysisGames={riskAnalysisGames} />;
            case 'history':
                return <HistoryPage history={signalHistory} onReplayGame={handleReplayGame} />;
            case 'info':
                return <InformationPage />;
            case 'subscription':
                return <SubscriptionPage onRequestSubscription={handleRequestSubscription} onRetrySubscription={onRetrySubscription} user={user} />;
            case 'profile':
                return <ProfilePage user={user} onSave={handleSaveProfile} onLogout={handleLogout} allGames={allGames} />;
            case 'admin':
                return <AdminPage allUsers={allUsers} managedGames={managedGames} setManagedGames={setManagedGamesState} autoApprovingUsers={autoApprovingUsers} handleApprove={handleApprove} handleDisapprove={handleDisapprove} setIsStatsModalOpen={setIsStatsModalOpen} activityLog={activityLog} addActivityLog={addActivityLog} highPayoutGamesCount={highPayoutGamesCount} lowPayoutGamesCount={lowPayoutGamesCount} approvalHistory={approvalHistory} />;
            case 'settings':
                return <SettingsPage autoApprove={autoApprove} setAutoApprove={setAutoApproveState} systemSettings={systemSettings} setSystemSettings={setSystemSettings} payoutSettings={payoutSettings} setPayoutSettings={setPayoutSettings} setIsHistoryModalOpen={setIsHistoryModalOpen} addActivityLog={addActivityLog} />;
            default:
                return <GameSelection games={managedGames} onGameSelect={handleGameSelect} user={user} onNavigate={handleNavigate} gamePayouts={gamePayouts} gamePayoutStates={gamePayoutStates} payoutSettings={payoutSettings} generatingGameName={generatingGameName} onToggleFavorite={handleToggleFavorite} activeSignalGames={activeSignalGames} riskAnalysisGames={riskAnalysisGames} />;
        }
    };

    return (
        <div className="text-white min-h-screen font-sans">
             {systemSettings.announcement && (
                <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black font-bold text-center p-2 z-50 text-sm animate-pulse">
                    {systemSettings.announcement}
                </div>
            )}
            <main className="pb-24 pt-8 px-4 flex flex-col items-center min-h-screen w-full">
                {renderPage()}
            </main>
            {user && <BottomNav currentPage={currentPage} onNavigate={handleNavigate} user={user} />}
            {isHistoryModalOpen && (
                <ApprovalHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    approvalHistory={approvalHistory}
                />
            )}
        </div>
    );
};

export default App;
