import React, { useState, useRef, useEffect } from 'react';

interface TopBarProps {
    onSaveMap: () => void;
    onLoadMap: () => void;
    onClearMap: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onSaveMap, onLoadMap, onClearMap, onUndo, onRedo, canUndo, canRedo }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (menu: string) => {
        setActiveMenu(activeMenu === menu ? null : menu);
    };

    return (
        <div className="h-10 bg-zinc-950 border-b border-gold-500/30 flex items-center px-4 text-xs text-zinc-400 select-none relative z-50 font-fantasy" ref={menuRef}>
            <div className="flex items-center space-x-4 mr-8">
                {/* History Controls */}
                <div className="flex space-x-1">
                    <button
                        className={`p-1 transition-colors ${canUndo ? 'hover:text-gold-400' : 'text-zinc-700 cursor-not-allowed'}`}
                        title="Undo"
                        onClick={onUndo}
                        disabled={!canUndo}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                    </button>
                    <button
                        className={`p-1 transition-colors ${canRedo ? 'hover:text-gold-400' : 'text-zinc-700 cursor-not-allowed'}`}
                        title="Redo"
                        onClick={onRedo}
                        disabled={!canRedo}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                        </svg>
                    </button>
                </div>
                <div className="flex items-center space-x-1 border border-zinc-800 rounded px-2 py-0.5 bg-zinc-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>History</span>
                </div>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center space-x-2 mr-auto font-sans">
                <button className="bg-gold-600 text-white px-2 py-1 rounded font-bold flex items-center space-x-1 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-fantasy text-[10px]">BG</span>
                </button>
                <button className="hover:bg-zinc-800 px-2 py-1 rounded flex items-center space-x-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-fantasy text-[10px]">FG</span>
                </button>
                <span className="text-zinc-700">|</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors font-fantasy">Top</span>
                <span className="text-zinc-700">|</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors font-fantasy">Shape: ■</span>
            </div>

            <div className="flex space-x-6 tracking-wide">
                <div className="relative">
                    <span
                        className={`hover:text-gold-400 cursor-pointer px-2 py-1 rounded flex items-center transition-colors ${activeMenu === 'File' ? 'text-gold-400' : ''}`}
                        onClick={() => handleMenuClick('File')}
                    >
                        File
                    </span>
                    {activeMenu === 'File' && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-zinc-900 border border-gold-500/30 shadow-xl rounded py-1 flex flex-col font-sans">
                            <button
                                className="text-left px-4 py-2 hover:bg-zinc-800 hover:text-gold-400 transition-colors flex items-center"
                                onClick={() => { onSaveMap(); setActiveMenu(null); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save Map
                            </button>
                            <button
                                className="text-left px-4 py-2 hover:bg-zinc-800 hover:text-gold-400 transition-colors flex items-center"
                                onClick={() => { onLoadMap(); setActiveMenu(null); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4M4 12h16" />
                                </svg>
                                Load Map
                            </button>
                            <div className="h-px bg-zinc-800 my-1"></div>
                            <button
                                className="text-left px-4 py-2 hover:bg-red-900/30 hover:text-red-400 transition-colors text-red-400 flex items-center"
                                onClick={() => { onClearMap(); setActiveMenu(null); }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear Map
                            </button>
                        </div>
                    )}
                </div>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Edit</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Image</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Layer</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Select</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Filter</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">View</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Window</span>
                <span className="hover:text-gold-400 cursor-pointer transition-colors">Help</span>
            </div>
            <div className="ml-auto text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                Fantasy Map Builder v1.0
            </div>
        </div>
    );
};

export default TopBar;
