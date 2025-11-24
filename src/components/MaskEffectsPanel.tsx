import React from 'react';
import type { MaskSettings } from '../types';

interface MaskEffectsPanelProps {
    settings: MaskSettings;
    onUpdateSettings: (settings: MaskSettings) => void;
    onClose: () => void;
}

const ColorSwatch: React.FC<{
    color: string;
    onChange: (color: string) => void;
}> = ({ color, onChange }) => {
    return (
        <div className="relative w-12 h-8 rounded border border-zinc-600 overflow-hidden cursor-pointer group">
            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30"></div>
            <div
                className="absolute inset-0"
                style={{ backgroundColor: color }}
            ></div>
            <input
                type="color"
                value={color.slice(0, 7)}
                onChange={(e) => {
                    const hex = e.target.value;
                    const alpha = color.length > 7 ? color.slice(7) : 'ff';
                    onChange(hex + alpha);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
        </div>
    );
};

const NumberInput: React.FC<{
    value: number;
    onChange: (val: number) => void;
    step?: number;
}> = ({ value, onChange, step = 0.1 }) => (
    <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        step={step}
        className="w-16 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-right focus:border-zinc-500 outline-none"
    />
);

const ShadowSettingsButton: React.FC<{
    isOpen: boolean;
    onClick: () => void;
}> = ({ isOpen, onClick }) => (
    <button
        onClick={onClick}
        className={`w-12 h-8 rounded border border-zinc-600 flex items-center justify-center transition-all ${isOpen ? 'ring-1 ring-zinc-500' : ''}`}
        style={{
            background: 'linear-gradient(135deg, #3f3f46 0%, #18181b 100%)'
        }}
    >
        <span className="font-serif font-bold text-zinc-400 text-lg drop-shadow-md">S</span>
    </button>
);

const MaskEffectsPanel: React.FC<MaskEffectsPanelProps> = ({ settings, onUpdateSettings, onClose }) => {
    const [openShadow, setOpenShadow] = React.useState<'outer' | 'inner' | null>(null);

    const updateStroke = (updates: Partial<MaskSettings['stroke']>) => {
        onUpdateSettings({
            ...settings,
            stroke: { ...settings.stroke, ...updates }
        });
    };

    const updateOutline = (updates: Partial<MaskSettings['outline']>) => {
        onUpdateSettings({
            ...settings,
            outline: { ...settings.outline, ...updates }
        });
    };

    const updateShadows = (type: 'outer' | 'inner', updates: Partial<MaskSettings['shadows']['outer']>) => {
        onUpdateSettings({
            ...settings,
            shadows: {
                ...settings.shadows,
                [type]: { ...settings.shadows[type], ...updates }
            }
        });
    };

    const updateRipples = (updates: Partial<MaskSettings['ripples']>) => {
        onUpdateSettings({
            ...settings,
            ripples: { ...settings.ripples, ...updates }
        });
    };

    return (
        <div className="absolute top-0 right-[-320px] w-[300px] bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 text-zinc-300 z-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-2">
                <h3 className="font-semibold text-zinc-200">Border Effect Options</h3>
                <div className="flex items-center gap-2">
                    <button className="text-zinc-500 hover:text-zinc-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                    </button>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Preset */}
            <div className="mb-4 flex items-center justify-between">
                <label className="text-sm">Preset</label>
                <select className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm w-32">
                    <option>Default</option>
                </select>
            </div>

            {/* Stroke */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.stroke.enabled}
                        onChange={(e) => updateStroke({ enabled: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-zinc-300">Stroke</span>
                </div>
                <div className="flex items-center gap-2">
                    <ColorSwatch
                        color={settings.stroke.color}
                        onChange={(color) => updateStroke({ color })}
                    />
                    <NumberInput
                        value={settings.stroke.width}
                        onChange={(width) => updateStroke({ width })}
                    />
                </div>
            </div>

            {/* Outline */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.outline.enabled}
                        onChange={(e) => updateOutline({ enabled: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-zinc-300">Outline</span>
                </div>
                <div className="flex items-center gap-2">
                    <ColorSwatch
                        color={settings.outline.color}
                        onChange={(color) => updateOutline({ color })}
                    />
                    <NumberInput
                        value={settings.outline.width}
                        onChange={(width) => updateOutline({ width })}
                    />
                </div>
            </div>

            {/* Outer Shadows */}
            <div className="mb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.shadows.outer.enabled}
                            onChange={(e) => updateShadows('outer', { enabled: e.target.checked })}
                            className="rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-zinc-300">Outer shadows</span>
                    </div>
                    <ShadowSettingsButton
                        isOpen={openShadow === 'outer'}
                        onClick={() => setOpenShadow(openShadow === 'outer' ? null : 'outer')}
                    />
                </div>
                {openShadow === 'outer' && (
                    <div className="mt-2 flex items-center justify-end gap-2 p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
                        <ColorSwatch
                            color={settings.shadows.outer.color}
                            onChange={(color) => updateShadows('outer', { color })}
                        />
                        <NumberInput
                            value={settings.shadows.outer.blur}
                            onChange={(blur) => updateShadows('outer', { blur })}
                            step={1}
                        />
                    </div>
                )}
            </div>

            {/* Inner Shadows */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.shadows.inner.enabled}
                            onChange={(e) => updateShadows('inner', { enabled: e.target.checked })}
                            className="rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-zinc-300">Inner shadows</span>
                    </div>
                    <ShadowSettingsButton
                        isOpen={openShadow === 'inner'}
                        onClick={() => setOpenShadow(openShadow === 'inner' ? null : 'inner')}
                    />
                </div>
                {openShadow === 'inner' && (
                    <div className="mt-2 flex items-center justify-end gap-2 p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
                        <ColorSwatch
                            color={settings.shadows.inner.color}
                            onChange={(color) => updateShadows('inner', { color })}
                        />
                        <NumberInput
                            value={settings.shadows.inner.blur}
                            onChange={(blur) => updateShadows('inner', { blur })}
                            step={1}
                        />
                    </div>
                )}
            </div>

            <hr className="border-zinc-700 mb-4" />

            {/* Ripples Effect */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.ripples.enabled}
                        onChange={(e) => updateRipples({ enabled: e.target.checked })}
                        className="rounded bg-zinc-800 border-zinc-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm">Ripples Effect</span>
                </div>
                <div className="w-8 h-6 bg-zinc-700 border border-zinc-600 rounded cursor-pointer hover:border-zinc-500 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[url('/assets/background/FantasyWorld/water/asset_14.jpg')] bg-cover opacity-50"></div>
                </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <label className="text-sm w-12">Width</label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.ripples.width}
                        onChange={(e) => updateRipples({ width: parseFloat(e.target.value) })}
                        className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <input
                        type="number"
                        value={settings.ripples.width}
                        onChange={(e) => updateRipples({ width: parseFloat(e.target.value) })}
                        className="w-12 bg-zinc-800 border border-zinc-600 rounded px-1 py-1 text-xs text-center"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="text-sm w-12">Count</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={settings.ripples.count}
                        onChange={(e) => updateRipples({ count: parseInt(e.target.value) })}
                        className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <input
                        type="number"
                        value={settings.ripples.count}
                        onChange={(e) => updateRipples({ count: parseInt(e.target.value) })}
                        className="w-12 bg-zinc-800 border border-zinc-600 rounded px-1 py-1 text-xs text-center"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="text-sm w-12">Gap</label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={settings.ripples.gap}
                        onChange={(e) => updateRipples({ gap: parseFloat(e.target.value) })}
                        className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <input
                        type="number"
                        value={settings.ripples.gap}
                        onChange={(e) => updateRipples({ gap: parseFloat(e.target.value) })}
                        className="w-12 bg-zinc-800 border border-zinc-600 rounded px-1 py-1 text-xs text-center"
                    />
                </div>
            </div>
        </div>
    );
};

export default MaskEffectsPanel;
