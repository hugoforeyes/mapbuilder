import React from 'react';
import AssetSelector from './AssetSelector';

interface ItemOptionsProps {
    selectedGroup?: string[] | null;
    selectedAsset: string | null;
    onSelectAsset?: (asset: string) => void;
    onOpenCatalog: () => void;
    itemPlacementMode?: 'single' | 'multiple';
    setItemPlacementMode?: (mode: 'single' | 'multiple') => void;
    isRandomPlacement?: boolean;
    setIsRandomPlacement?: (isRandom: boolean) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    itemOpacity: number;
    setItemOpacity: (opacity: number) => void;
}

const ItemOptions: React.FC<ItemOptionsProps> = ({
    selectedGroup,
    selectedAsset,
    onSelectAsset,
    onOpenCatalog,
    itemPlacementMode,
    setItemPlacementMode,
    isRandomPlacement,
    setIsRandomPlacement,
    brushSize,
    setBrushSize,
    itemOpacity,
    setItemOpacity,
}) => {
    return (
        <>
            <AssetSelector
                label="Object"
                selectedGroup={selectedGroup}
                selectedAsset={selectedAsset}
                onSelectAsset={onSelectAsset}
                onOpenCatalog={onOpenCatalog}
                showRandomToggle
                isRandomPlacement={isRandomPlacement}
                setIsRandomPlacement={setIsRandomPlacement}
            />

            <div className="space-y-4">
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

                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Scale</span>
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
                        <span>Item Opacity</span>
                        <span>{Math.round(itemOpacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={itemOpacity}
                        onChange={(e) => setItemOpacity(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                </div>
            </div>
        </>
    );
};

export default ItemOptions;
