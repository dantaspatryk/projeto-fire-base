
import React from 'react';
import type { SignalConfig } from '../types';

interface ConfiguratorProps {
  config: SignalConfig;
  onConfigChange: (newConfig: SignalConfig) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const Configurator: React.FC<ConfiguratorProps> = ({ config, onConfigChange, onGenerate, isLoading }) => {
  const handleSelectChange = <K extends keyof SignalConfig,>(key: K, value: string) => {
    onConfigChange({ ...config, [key]: Number(value) });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...config, assertiveness: Number(e.target.value) });
  };
  
  const renderSelect = (label: string, key: keyof SignalConfig, min: number, max: number, suffix: string) => (
    <div className="flex flex-col gap-2">
      {/* FIX: The 'key' variable, of type 'keyof SignalConfig', is cast to a string to satisfy the 'htmlFor' prop which requires a string. */}
      <label htmlFor={key as string} className="text-white font-medium text-sm">
        {label}
      </label>
      <select
        // FIX: The 'key' variable is also cast to a string for the 'id' prop for the same reason.
        id={key as string}
        value={config[key]}
        onChange={(e) => handleSelectChange(key, e.target.value)}
        className="bg-gray-800/50 border border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
      >
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(num => (
          <option key={num} value={num}>
            {num} {suffix}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/30">
      <div className="space-y-6">
        {renderSelect('Horários Pagantes (MÁX)', 'payingTimes', 1, 10, 'Horários')}
        {renderSelect('Número de Rodadas (TURBO)', 'turboRounds', 5, 15, 'Rodadas')}
        {renderSelect('Número de Rodadas (NORMAL)', 'normalRounds', 5, 15, 'Rodadas')}
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label htmlFor="assertiveness" className="text-white font-medium text-sm">Assertividade</label>
            <span className="text-green-400 font-bold text-lg">{config.assertiveness}%</span>
          </div>
          <input
            id="assertiveness"
            type="range"
            min="75"
            max="99"
            step="1"
            value={config.assertiveness}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-green-500"
          />
        </div>
        
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-black font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-green-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'GERANDO...' : 'GERAR SINAL'}
        </button>
      </div>
    </div>
  );
};

export default Configurator;
