import React from 'react';
import type { ToolType } from '../types';

interface ToolOptionsPanelProps {
    selectedTool: ToolType;
    selectedAsset: string | null;
    onOpenCatalog: () => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
}

const ToolOptionsPanel: React.FC<ToolOptionsPanelProps> = ({
    selectedTool,
    selectedAsset,
    onOpenCatalog,
    brushSize,
    setBrushSize,
}) => {
    if (selectedTool === 'select' || selectedTool === 'hand') return null;

    return (
        <div className="absolute top-12 left-14 w-64 bg-zinc-900 border border-gold-500/30 rounded shadow-xl flex flex-col text-zinc-300 select-none z-40 font-fantasy">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gold-500/30 bg-zinc-950 rounded-t">
                <span className="font-semibold text-sm text-gold-400 tracking-wider">
                    {selectedTool === 'brush' ? 'Brush Tool' : 'Item Tool'}
                </span>
                <button className="text-zinc-500 hover:text-gold-400 transition-colors">
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
                            <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Brush Settings</div>
                            {/* Procedural options removed */}
                        </div>
                    </div>
                )}

                {/* Texture / Object Selection */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider font-fantasy">
                            {selectedTool === 'brush' ? 'Texture' : 'Object'}
                        </div>
                        {selectedTool === 'brush' && (
                            <button className="text-xs bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-0.5 rounded hover:bg-green-900 transition-colors flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Upgrade
                            </button>
                        )}
                    </div>

                    <div
                        className="h-24 bg-zinc-950 border border-zinc-700 rounded flex items-center justify-center cursor-pointer hover:border-gold-500 transition-colors group relative overflow-hidden"
                        onClick={onOpenCatalog}
                    >
                        {selectedAsset ? (
                            <img src={selectedAsset} alt="Selected" className="w-full h-full object-cover" />
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
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                    {/* Mode Toggles (Mock) */}
                    <div>
                        <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider font-fantasy">Mode</div>
                        <div className="flex space-x-2">
                            <button className="p-1 bg-gold-600 text-white rounded shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button className="p-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                            <span>{selectedTool === 'brush' ? 'Brush Size' : 'Scale'}</span>
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

                    <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                            <span>Opacity</span>
                            <span>100</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="100"
                            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        />
                    </div>

                    {selectedTool === 'brush' && (
                        <div>
                            <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                                <span>Softness</span>
                                <span>0.5</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                defaultValue="0.5"
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                            />
                        </div>
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
            </div>
        </div>
    );
};

export default ToolOptionsPanel;
