import React from 'react';
import AssetSelector from './AssetSelector';

interface BrushOptionsProps {
    selectedLayer?: 'background' | 'foreground' | 'top';
    setSelectedLayer?: (layer: 'background' | 'foreground' | 'top') => void;
    selectedGroup?: string[] | null;
    selectedAsset: string | null;
    onSelectAsset?: (asset: string) => void;
    onOpenCatalog: () => void;
    brushShape: 'circle' | 'rough';
    setBrushShape: (shape: 'circle' | 'rough') => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    brushOpacity: number;
    setBrushOpacity: (opacity: number) => void;
    brushSoftness: number;
    setBrushSoftness: (softness: number) => void;
    brushRoughness: number;
    setBrushRoughness: (roughness: number) => void;
    brushSmooth: boolean;
    setBrushSmooth: (smooth: boolean) => void;
}

const BrushOptions: React.FC<BrushOptionsProps> = ({
    selectedLayer,
    setSelectedLayer,
    selectedGroup,
    selectedAsset,
    onSelectAsset,
    onOpenCatalog,
    brushShape,
    setBrushShape,
    brushSize,
    setBrushSize,
    brushOpacity,
    setBrushOpacity,
    brushSoftness,
    setBrushSoftness,
    brushRoughness,
    setBrushRoughness,
    brushSmooth,
    setBrushSmooth,
}) => {
    return (
        <>
            <div className="space-y-3">
                <div>
                    <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Brush Layers</div>
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
                        <button
                            onClick={() => setSelectedLayer?.('top')}
                            className={`flex-1 py-1 px-2 text-[10px] font-medium rounded transition-colors ${selectedLayer === 'top' ? 'bg-gold-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            title="Always rendered above items and text"
                        >
                            Top
                        </button>
                    </div>
                </div>
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

                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Brush Opacity</span>
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
                </div>

                {brushShape !== 'rough' && (
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

            <div className="pt-2 border-t border-zinc-700">
                <button className="w-full flex items-center justify-between text-xs text-zinc-400 hover:text-gold-400 font-fantasy">
                    <span>Advanced Settings</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default BrushOptions;
