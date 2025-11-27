import React from 'react';

interface AssetSelectorProps {
    label: string;
    selectedGroup?: string[] | null;
    selectedAsset: string | null;
    onSelectAsset?: (asset: string) => void;
    onOpenCatalog: () => void;
    showRandomToggle?: boolean;
    isRandomPlacement?: boolean;
    setIsRandomPlacement?: (value: boolean) => void;
    showUpgradeButton?: boolean;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
    label,
    selectedGroup,
    selectedAsset,
    onSelectAsset,
    onOpenCatalog,
    showRandomToggle = false,
    isRandomPlacement,
    setIsRandomPlacement,
    showUpgradeButton = false,
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider font-fantasy">
                    {label}
                </div>
                {showUpgradeButton && (
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
                        {showRandomToggle && (
                            <label className="flex items-center space-x-1 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={!!isRandomPlacement}
                                    onChange={(e) => setIsRandomPlacement?.(e.target.checked)}
                                    className="w-3 h-3 rounded border-zinc-600 bg-zinc-800 text-gold-500 focus:ring-gold-500/50 accent-gold-500"
                                />
                                <span className="text-[10px] text-zinc-400">Random</span>
                            </label>
                        )}
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
    );
};

export default AssetSelector;
