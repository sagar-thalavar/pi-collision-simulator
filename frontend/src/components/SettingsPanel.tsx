import React, { useState } from 'react';
import { Settings2, Play, Pause } from 'lucide-react';

interface SettingsPanelProps {
    onStartSimulation: (mass1: number, mass2: number) => void;
    onStop: () => void;
    isPlaying: boolean;
    speedMultiplier: number;
    onSpeedChange: (speed: number) => void;
    backendVerification: (mass1: number, mass2: number) => Promise<string>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    onStartSimulation,
    onStop,
    isPlaying,
    speedMultiplier,
    onSpeedChange,
    backendVerification
}) => {
    const [digits, setDigits] = useState(2);
    const [m1, setM1] = useState(1);
    const [m2, setM2] = useState(100);
    const [useBackend, setUseBackend] = useState(false);
    const [backendResult, setBackendResult] = useState('');

    // Sync masses when digits slider changes manually
    const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setDigits(val);
        setM1(1);
        setM2(Math.pow(100, val - 1));
    };

    const handleStart = async () => {
        onStartSimulation(m1, m2);
        if (useBackend) {
            setBackendResult('Loading...');
            const res = await backendVerification(m1, m2);
            setBackendResult(res);
        }
    };

    return (
        <div className="bg-emerald-900/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-emerald-800/50 w-full sm:w-80 flex flex-col gap-6 relative overflow-hidden transition-all backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 pb-4 border-b border-emerald-800/50">
                <Settings2 size={24} className="text-red-500" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                    Simulation Settings
                </h2>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-emerald-300">Target Pi Digits (Auto-fill)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="7"
                        value={digits}
                        onChange={handleDigitsChange}
                        className="flex-1 accent-red-500"
                        disabled={isPlaying}
                    />
                    <span className="font-bold text-lg bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800/50 w-12 text-center text-red-400">
                        {digits}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-emerald-300">Manual Masses (kg)</label>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-emerald-500 w-16 uppercase tracking-wider">Mass 1</label>
                    <input
                        type="number"
                        min="1"
                        value={m1}
                        onChange={(e) => setM1(Number(e.target.value))}
                        className="flex-1 bg-emerald-950 border border-emerald-800/50 rounded-xl px-3 py-2 text-sm text-emerald-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                        disabled={isPlaying}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-emerald-500 w-16 uppercase tracking-wider">Mass 2</label>
                    <input
                        type="number"
                        min="1"
                        value={m2}
                        onChange={(e) => setM2(Number(e.target.value))}
                        className="flex-1 bg-emerald-950 border border-emerald-800/50 rounded-xl px-3 py-2 text-sm text-emerald-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                        disabled={isPlaying}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-emerald-300">Playback Speed (x)</label>
                </div>
                <div className="flex items-center gap-4 mt-1">
                    <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={speedMultiplier}
                        onChange={(e) => onSpeedChange(Number(e.target.value))}
                        className="flex-1 bg-emerald-950 border border-emerald-800/50 rounded-xl px-3 py-2 text-sm text-emerald-50 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all font-mono"
                        disabled={isPlaying}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="useBackend"
                        checked={useBackend}
                        onChange={(e) => setUseBackend(e.target.checked)}
                        className="w-5 h-5 accent-red-500 rounded border-emerald-700 cursor-pointer"
                    />
                    <label htmlFor="useBackend" className="text-sm font-semibold text-emerald-300 cursor-pointer">
                        Verify with Backend Engine
                    </label>
                </div>

                {useBackend && backendResult && (
                    <div className="p-3 bg-emerald-950 rounded-xl border border-emerald-800/50 text-sm mt-2 flex justify-between items-center shadow-inner">
                        <span className="text-emerald-500 font-medium">Result:</span>
                        <span className="font-black text-red-500 font-mono text-lg">{backendResult}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-emerald-800/50">
                {isPlaying && (
                    <button
                        onClick={onStop}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all bg-emerald-800/50 hover:bg-emerald-700 text-red-500 border border-emerald-700/50 shadow-sm"
                        title="End Simulation"
                    >
                        <Pause size={18} /> End
                    </button>
                )}

                <button
                    onClick={handleStart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 border border-red-500"
                >
                    <Play size={18} /> {isPlaying ? 'Restart' : 'Start'}
                </button>
            </div>
        </div>
    );
};
