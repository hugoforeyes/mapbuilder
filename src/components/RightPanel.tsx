import React, { useState, useEffect } from 'react';
import assetsData from '../assets.json';
import type { MapItem, ToolType } from '../types';

interface RightPanelProps {
    onSelectAsset: (asset: string) => void;
    selectedAsset: string | null;
    items: MapItem[];
    onSelectItem: (id: string | null) => void;
    selectedItemId: string | null;
    onDeleteItem: (id: string) => void;
    selectedTool: ToolType;
    onSelectGroup?: (group: string[]) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
    onSelectAsset,
    selectedAsset,
    items,
    onSelectItem,
    selectedItemId,
    onDeleteItem,
    selectedTool,
    onSelectGroup
}) => {
    const [activeTab, setActiveTab] = useState<'assets' | 'layers'>('assets');
    const categories = Object.keys(assetsData);
    const [assetCategory, setAssetCategory] = useState<string>(
        selectedTool === 'brush' ? 'background' : 'items'
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }
        setExpandedGroups(newExpanded);
    };

    useEffect(() => {
        if (selectedTool === 'brush') {
            setAssetCategory('background');
        } else if (selectedTool === 'item') {
            setAssetCategory('items');
        }
    }, [selectedTool]);

    // @ts-ignore
    const assets: string[] = assetsData[assetCategory] || [];

    const filteredAssets = assets.filter((asset: string) =>
        asset.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-80 bg-zinc-900 border-l border-gold-500/30 flex flex-col h-full font-fantasy">
            {/* Panel Tabs */}
            <div className="flex border-b border-gold-500/30 bg-zinc-950">
                <button
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-fantasy flex items-center justify-center space-x-2 transition-colors ${activeTab === 'assets' ? 'bg-zinc-900 text-gold-400 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                        }`}
                    onClick={() => setActiveTab('assets')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Assets</span>
                </button>
                <button
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-fantasy flex items-center justify-center space-x-2 transition-colors ${activeTab === 'layers' ? 'bg-zinc-900 text-gold-400 border-b-2 border-gold-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                        }`}
                    onClick={() => setActiveTab('layers')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Layers</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-900">
                {activeTab === 'assets' && (
                    <>
                        <div className="p-3 border-b border-zinc-800 space-y-3 bg-zinc-900">
                            <div className="flex bg-zinc-950 rounded p-1 border border-zinc-800 overflow-x-auto no-scrollbar space-x-1">
                                {categories.filter(cat => {
                                    if (selectedTool === 'brush') return cat === 'background';
                                    if (selectedTool === 'item') return cat === 'items';
                                    return true;
                                }).map((category) => (
                                    <button
                                        key={category}
                                        className={`flex-1 py-1.5 px-2 text-xs rounded font-medium flex items-center justify-center space-x-1 transition-all whitespace-nowrap ${assetCategory === category ? 'bg-gold-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                                            }`}
                                        onClick={() => setAssetCategory(category)}
                                    >
                                        <span className="capitalize">{category}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search assets..."
                                    className="w-full bg-zinc-950 text-zinc-200 border border-zinc-700 focus:border-gold-500 rounded pl-8 pr-2 py-1.5 text-sm focus:outline-none transition-colors placeholder-zinc-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 bg-zinc-900">
                            {Object.entries(
                                filteredAssets.reduce((acc: { [key: string]: string[] }, asset: string) => {
                                    const parts = asset.split('/');
                                    const groupName = parts[parts.length - 2];
                                    if (!acc[groupName]) acc[groupName] = [];
                                    acc[groupName].push(asset);
                                    return acc;
                                }, {})
                            ).map(([groupName, groupAssets]: [string, string[]]) => {
                                // Group assets by base name (e.g. Tree_1, Tree_2 -> Tree)
                                const groupedItems = groupAssets.reduce((acc: { [key: string]: string[] }, asset) => {
                                    const fileName = asset.split('/').pop() || '';
                                    // Remove extension
                                    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

                                    let baseName = nameWithoutExt;
                                    // Only group items if NOT using the brush tool
                                    if (selectedTool !== 'brush') {
                                        const match = nameWithoutExt.match(/^(.*)_\d+$/);
                                        if (match) baseName = match[1];
                                    }

                                    if (!acc[baseName]) acc[baseName] = [];
                                    acc[baseName].push(asset);
                                    return acc;
                                }, {});

                                return (
                                    <div key={groupName} className="mb-4">
                                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1 sticky top-0 bg-zinc-900/95 backdrop-blur-sm py-1 z-10 border-b border-zinc-800/50">
                                            {groupName.replace(/_/g, ' ')}
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 content-start">
                                            {Object.entries(groupedItems).map(([baseName, items]) => {
                                                const isGroup = items.length > 1;
                                                const isExpanded = expandedGroups.has(baseName);
                                                const displayItems = isGroup && isExpanded ? items : [items[0]];

                                                return (
                                                    <React.Fragment key={baseName}>
                                                        {displayItems.map((asset, idx) => (
                                                            <button
                                                                key={asset}
                                                                className={`aspect-square rounded overflow-hidden border transition-all group relative bg-zinc-950 ${selectedAsset === asset
                                                                    ? 'border-gold-500 ring-1 ring-gold-500 shadow-lg shadow-gold-500/20'
                                                                    : 'border-zinc-800 hover:border-gold-500/50'
                                                                    }`}
                                                                onClick={() => {
                                                                    if (isGroup && idx === 0) {
                                                                        if (onSelectGroup) {
                                                                            onSelectGroup(items);
                                                                        } else {
                                                                            // Fallback to old toggle behavior if prop not provided
                                                                            toggleGroup(baseName);
                                                                        }
                                                                    } else {
                                                                        onSelectAsset(asset);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="w-full h-full p-1 flex items-center justify-center">
                                                                    <img
                                                                        src={asset}
                                                                        alt={asset.split('/').pop()}
                                                                        className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-300"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                                {isGroup && idx === 0 && (
                                                                    <div className="absolute bottom-0 right-0 bg-zinc-900/80 text-gold-400 text-[10px] px-1 rounded-tl border-t border-l border-zinc-800 font-mono">
                                                                        {isExpanded ? '-' : `+${items.length - 1}`}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeTab === 'layers' && (
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-zinc-900">
                        {items.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 text-zinc-600 space-y-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="text-sm font-fantasy">No items placed</span>
                            </div>
                        )}
                        {[...items].reverse().map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center p-2 rounded cursor-pointer group border transition-all ${selectedItemId === item.id
                                    ? 'bg-gold-900/20 border-gold-500/50'
                                    : 'hover:bg-zinc-800 border-transparent hover:border-zinc-700'
                                    }`}
                                onClick={() => onSelectItem(item.id)}
                            >
                                <img src={item.src} className="w-8 h-8 object-contain bg-zinc-950 rounded mr-3 border border-zinc-800" alt="layer" />
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm truncate ${selectedItemId === item.id ? 'text-gold-400' : 'text-zinc-300'}`}>
                                        {item.src.split('/').pop()}
                                    </div>
                                    <div className="text-xs text-zinc-600 font-mono">ID: {item.id.slice(-4)}</div>
                                </div>
                                <button
                                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteItem(item.id);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightPanel;
