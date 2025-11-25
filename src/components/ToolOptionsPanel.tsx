import React from 'react';
import type { ToolType, MaskSettings } from '../types';
import { useState } from 'react';
import MaskEffectsPanel from './MaskEffectsPanel';

interface ToolOptionsPanelProps {
    selectedTool: ToolType;
    selectedAsset: string | null;
    onOpenCatalog: () => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    brushOpacity: number;
    setBrushOpacity: (opacity: number) => void;
    brushSoftness: number;
    setBrushSoftness: (softness: number) => void;
    brushShape: 'circle' | 'rough';
    setBrushShape: (shape: 'circle' | 'rough') => void;
    brushRoughness: number;
    setBrushRoughness: (roughness: number) => void;
    brushSmooth: boolean;
    setBrushSmooth: (smooth: boolean) => void;
    selectedLayer?: 'background' | 'foreground';
    setSelectedLayer?: (layer: 'background' | 'foreground') => void;
    selectedGroup?: string[] | null;
    onSelectAsset?: (asset: string) => void;
    onClose: () => void;
    itemPlacementMode?: 'single' | 'multiple';
    setItemPlacementMode?: (mode: 'single' | 'multiple') => void;
    isRandomPlacement?: boolean;
    setIsRandomPlacement?: (isRandom: boolean) => void;
    maskEffectsEnabled?: boolean;
    setMaskEffectsEnabled?: (enabled: boolean) => void;
    maskEffectsSettings?: MaskSettings;
    setMaskEffectsSettings?: (settings: MaskSettings) => void;
    maskAction?: 'add' | 'subtract';
    setMaskAction?: (mode: 'add' | 'subtract') => void;
}

const ToolOptionsPanel: React.FC<ToolOptionsPanelProps> = ({
    selectedTool,
    selectedAsset,
    onOpenCatalog,
    brushSize,
    setBrushSize,
    brushOpacity,
    setBrushOpacity,
    brushSoftness,
    setBrushSoftness,
    brushShape,
    setBrushShape,
    brushRoughness,
    setBrushRoughness,
    brushSmooth,
    setBrushSmooth,
    selectedLayer,
    setSelectedLayer,
    selectedGroup,
    onSelectAsset,
    onClose,
    itemPlacementMode,
    setItemPlacementMode,
    isRandomPlacement,
    setIsRandomPlacement,
    maskEffectsEnabled,
    setMaskEffectsEnabled,
    maskEffectsSettings,
    setMaskEffectsSettings,
    maskAction = 'add',
    setMaskAction,
}) => {
    const [isMaskSettingsOpen, setIsMaskSettingsOpen] = useState(false);

    if (selectedTool === 'select' || selectedTool === 'hand') return null;

    return (
        <div className="absolute top-12 left-14 w-64 bg-zinc-900 border border-gold-500/30 rounded shadow-xl flex flex-col text-zinc-300 select-none z-40 font-fantasy">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gold-500/30 bg-zinc-950 rounded-t">
                <span className="font-semibold text-sm text-gold-400 tracking-wider">
                    {selectedTool === 'brush' ? 'Brush Tool' : selectedTool === 'mask' ? 'Mask Tool' : 'Item Tool'}
                </span>
                <button
                    className="text-zinc-500 hover:text-gold-400 transition-colors"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-3 space-y-4 font-sans">
                {/* Brush Layer Toggles */}
                {selectedTool === 'brush' && (
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Brush Layers</div>
                            {/* Layer Selection */}
                            <div className="flex bg-zinc-800 rounded p-0.5 border border-zinc-700 mb-2">
                                <button
                                    onClick={() => setSelectedLayer?.('background')}
                                    className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors ${selectedLayer === 'background' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    Background
                                </button>
                                <button
                                    onClick={() => setSelectedLayer?.('foreground')}
                                    className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors ${selectedLayer === 'foreground' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    Foreground
                                </button>
                            </div>
                        </div>
                    </div>

                )}

                {/* Mask Effects (Mask Tool Only) */}
                {selectedTool === 'mask' && (
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

                        {/* Settings Panel */}
                        {isMaskSettingsOpen && maskEffectsSettings && setMaskEffectsSettings && (
                            <MaskEffectsPanel
                                settings={maskEffectsSettings}
                                onUpdateSettings={setMaskEffectsSettings}
                                onClose={() => setIsMaskSettingsOpen(false)}
                            />
                        )}
                    </div>
                )}

                {/* Texture / Object Selection */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider font-fantasy">
                            {selectedTool === 'brush' || selectedTool === 'mask' ? 'Texture' : 'Object'}
                        </div>
                        {(selectedTool === 'brush' || selectedTool === 'mask') && (
                            <button className="text-xs bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-0.5 rounded hover:bg-green-900 transition-colors flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Upgrade
                            </button>
                        )}
                    </div>

                    {selectedGroup && selectedGroup.length > 1 ? (
                        <div className="bg-zinc-950 border border-zinc-700 rounded overflow-hidden">
                            <div className="flex h-32">
                                {/* Left: Preview */}
                                <div
                                    className="w-1/2 bg-zinc-900/50 relative flex items-center justify-center border-r border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors"
                                    onClick={onOpenCatalog}
                                >
                                    <img
                                        src={selectedAsset || selectedGroup[0]}
                                        alt="Preview"
                                        className="max-w-full max-h-full object-contain p-2"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-1 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const currentIndex = selectedGroup.indexOf(selectedAsset || selectedGroup[0]);
                                                const prevIndex = currentIndex > 0 ? currentIndex - 1 : selectedGroup.length - 1;
                                                onSelectAsset?.(selectedGroup[prevIndex]);
                                            }}
                                            className="p-0.5 hover:text-white text-zinc-400 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <span className="text-xs font-bold text-white drop-shadow-md">
                                            {(selectedGroup.indexOf(selectedAsset || selectedGroup[0]) + 1)} / {selectedGroup.length}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const currentIndex = selectedGroup.indexOf(selectedAsset || selectedGroup[0]);
                                                const nextIndex = currentIndex < selectedGroup.length - 1 ? currentIndex + 1 : 0;
                                                onSelectAsset?.(selectedGroup[nextIndex]);
                                            }}
                                            className="p-0.5 hover:text-white text-zinc-400 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {/* Right: Grid */}
                                <div className="w-1/2 p-1 overflow-y-auto bg-zinc-900 custom-scrollbar">
                                    <div className="grid grid-cols-3 gap-1">
                                        {selectedGroup.map((asset, idx) => (
                                            <button
                                                key={asset}
                                                onClick={() => onSelectAsset?.(asset)}
                                                className={`aspect-square relative group border ${selectedAsset === asset
                                                    ? 'border-gold-500 bg-zinc-800'
                                                    : 'border-transparent hover:border-zinc-600'
                                                    }`}
                                            >
                                                <img
                                                    src={asset}
                                                    alt={`Var ${idx + 1}`}
                                                    className="w-full h-full object-contain p-0.5"
                                                />
                                                <span className="absolute bottom-0 right-0.5 text-[8px] font-bold text-white drop-shadow-md">
                                                    {idx + 1}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-1.5 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
                                <button
                                    className="text-xs text-zinc-400 hover:text-gold-400 font-fantasy flex items-center"
                                    onClick={onOpenCatalog}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    Catalog
                                </button>
                                <label className="flex items-center space-x-1 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isRandomPlacement}
                                        onChange={(e) => setIsRandomPlacement?.(e.target.checked)}
                                        className="w-3 h-3 rounded border-zinc-600 bg-zinc-800 text-gold-500 focus:ring-gold-500/50 accent-gold-500"
                                    />
                                    <span className="text-[10px] text-zinc-400">Random</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className="h-24 bg-zinc-950 border border-zinc-700 rounded flex items-center justify-center cursor-pointer hover:border-gold-500 transition-colors group relative overflow-hidden"
                                onClick={onOpenCatalog}
                            >
                                {selectedAsset ? (
                                    <img src={selectedAsset} alt="Selected" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-600 group-hover:text-gold-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs font-fantasy">Open Catalog</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium font-fantasy">Open Catalog</span>
                                </div>
                            </div>
                            <button
                                className="mt-2 w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-gold-500 rounded text-xs text-zinc-300 hover:text-gold-400 transition-colors flex items-center justify-center space-x-2"
                                onClick={onOpenCatalog}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="font-fantasy">Open Catalog</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                    {/* Mode Toggles (Mock) */}
                    {(selectedTool === 'brush' || selectedTool === 'mask') && (
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
                    )}

                    {selectedTool === 'item' && (
                        <div>
                            <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Placement</div>
                            <div className="flex bg-zinc-800 rounded p-0.5 border border-zinc-700">
                                <button
                                    onClick={() => setItemPlacementMode?.('single')}
                                    className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors ${itemPlacementMode === 'single' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    Single
                                </button>
                                <button
                                    onClick={() => setItemPlacementMode?.('multiple')}
                                    className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors ${itemPlacementMode === 'multiple' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    Multiple
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                            <span>{selectedTool === 'brush' || selectedTool === 'mask' ? 'Brush Size' : 'Scale'}</span>
                            <span>{brushSize}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            value={brushSize}
                            onChange={(e) => setBrushSize(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                    </div>

                    {selectedTool !== 'mask' && (
                        <>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                                <span>Opacity</span>
                                <span>{Math.round(brushOpacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={brushOpacity}
                                onChange={(e) => setBrushOpacity(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                            />
                        </>
                    )}
                </div>

                {selectedTool === 'brush' && brushShape !== 'rough' && (
                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                            <span>Softness</span>
                            <span>{brushSoftness}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={brushSoftness}
                            onChange={(e) => setBrushSoftness(Number(e.target.value))}
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                    </div>
                )}

                {(selectedTool === 'brush' || selectedTool === 'mask') && brushShape === 'rough' && (
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

            {
                (selectedTool === 'brush' || selectedTool === 'mask') && (
                    <div className="pt-2 border-t border-zinc-700">
                        <button className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-gold-400 font-fantasy">
                            <span>Advanced Settings</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default ToolOptionsPanel;
