import React from 'react';
import AssetSelector from './AssetSelector';
import MaskEffectsPanel from '../MaskEffectsPanel';
import type { MaskSettings } from '../../types';

interface MaskOptionsProps {
    maskEffectsEnabled?: boolean;
    setMaskEffectsEnabled?: (enabled: boolean) => void;
    maskEffectsSettings?: MaskSettings;
    setMaskEffectsSettings?: (settings: MaskSettings) => void;
    maskAction?: 'add' | 'subtract';
    setMaskAction?: (mode: 'add' | 'subtract') => void;
    isMaskSettingsOpen: boolean;
    setIsMaskSettingsOpen: (open: boolean) => void;
    selectedGroup?: string[] | null;
    selectedAsset: string | null;
    onSelectAsset?: (asset: string) => void;
    onOpenCatalog: () => void;
    brushShape: 'circle' | 'rough';
    setBrushShape: (shape: 'circle' | 'rough') => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    brushRoughness: number;
    setBrushRoughness: (roughness: number) => void;
    brushSmooth: boolean;
    setBrushSmooth: (smooth: boolean) => void;
}

const MaskOptions: React.FC<MaskOptionsProps> = ({
    maskEffectsEnabled,
    setMaskEffectsEnabled,
    maskEffectsSettings,
    setMaskEffectsSettings,
    maskAction = 'add',
    setMaskAction,
    isMaskSettingsOpen,
    setIsMaskSettingsOpen,
    selectedGroup,
    selectedAsset,
    onSelectAsset,
    onOpenCatalog,
    brushShape,
    setBrushShape,
    brushSize,
    setBrushSize,
    brushRoughness,
    setBrushRoughness,
    brushSmooth,
    setBrushSmooth,
}) => {
    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={maskEffectsEnabled}
                            onChange={(e) => setMaskEffectsEnabled?.(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/50 accent-amber-500"
                        />
                        <span className="text-sm text-zinc-300">Enable effects</span>
                    </label>
                    <button
                        onClick={() => setIsMaskSettingsOpen(!isMaskSettingsOpen)}
                        className={`p-1.5 rounded border transition-colors ${isMaskSettingsOpen ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
                        title="Effect Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-1">
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider font-fantasy">Action</div>
                    <div className="flex bg-zinc-800 rounded p-0.5 border border-zinc-700">
                        <button
                            onClick={() => setMaskAction?.('add')}
                            className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors flex items-center justify-center space-x-1 ${maskAction === 'add' ? 'bg-amber-400 text-black shadow-sm' : 'text-zinc-300 hover:text-white'}`}
                        >
                            <span className="text-xs font-bold">+</span>
                            <span>Add</span>
                        </button>
                        <button
                            onClick={() => setMaskAction?.('subtract')}
                            className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors flex items-center justify-center space-x-1 ${maskAction === 'subtract' ? 'bg-zinc-700 text-amber-100 shadow-inner' : 'text-zinc-300 hover:text-white'}`}
                        >
                            <span className="text-xs font-bold">-</span>
                            <span>Subtract</span>
                        </button>
                    </div>
                </div>

                {isMaskSettingsOpen && maskEffectsSettings && setMaskEffectsSettings && (
                    <MaskEffectsPanel
                        settings={maskEffectsSettings}
                        onUpdateSettings={setMaskEffectsSettings}
                        onClose={() => setIsMaskSettingsOpen(false)}
                    />
                )}
            </div>

            <AssetSelector
                label="Texture"
                selectedGroup={selectedGroup}
                selectedAsset={selectedAsset}
                onSelectAsset={onSelectAsset}
                onOpenCatalog={onOpenCatalog}
                showUpgradeButton
            />

            <div className="space-y-4">
                <div>
                    <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Mode</div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setBrushShape('circle')}
                            className={`p-1 rounded shadow-sm ${brushShape === 'circle' ? 'bg-gold-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                            title="Circle Brush"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setBrushShape('rough')}
                            className={`p-1 rounded shadow-sm ${brushShape === 'rough' ? 'bg-gold-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                            title="Rough Brush"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 2a8 8 0 00-8 8c0 4.418 3.582 8 8 8s8-3.582 8-8a8 8 0 00-8-8zm0 14c-3.314 0-6-2.686-6-6 0-3.314 2.686-6 6-6 3.314 0 6 2.686 6 6 0 3.314-2.686 6-6 6z" />
                                <path d="M10 4a6 6 0 00-6 6c0 3.314 2.686 6 6 6s6-2.686 6-6a6 6 0 00-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.5" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Brush Size</span>
                        <span>{brushSize}</span>
                    </div>
                    <input
                        type="range"
                        min={10}
                        max={200}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                </div>

                {brushShape === 'rough' && (
                    <>
                        <div>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                                <span>Roughness</span>
                                <span>{brushRoughness}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="32"
                                step="1"
                                value={brushRoughness}
                                onChange={(e) => setBrushRoughness(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-400 font-fantasy">Smooth Edges</span>
                            <input
                                type="checkbox"
                                checked={brushSmooth}
                                onChange={(e) => setBrushSmooth(e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-gold-500 focus:ring-gold-500/50"
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MaskOptions;
