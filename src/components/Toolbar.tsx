import React from 'react';
import type { ToolType } from '../types';

interface ToolbarProps {
    selectedTool: ToolType;
    onSelectTool: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onSelectTool }) => {
    return (
        <div className="w-10 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-2 z-50">
            <div className="flex flex-col space-y-2 w-full px-1">
                <button
                    className={`p-1.5 rounded transition-colors group relative ${selectedTool === 'select' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    onClick={() => onSelectTool('select')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-300 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-zinc-700">
                        Select Tool (V)
                    </span>
                </button>
                <button
                    className={`p-1.5 rounded transition-colors group relative ${selectedTool === 'brush' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    onClick={() => onSelectTool('brush')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-300 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-zinc-700">
                        Brush Tool (B)
                    </span>
                </button>
                <button
                    className={`p-1.5 rounded transition-colors group relative ${selectedTool === 'item' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    onClick={() => onSelectTool('item')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-300 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-zinc-700">
                        Object Tool (I)
                    </span>
                </button>
                <button
                    className={`p-1.5 rounded transition-colors group relative ${selectedTool === 'hand' ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    onClick={() => onSelectTool('hand')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-300 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-zinc-700">
                        Hand Tool (H)
                    </span>
                </button>

                <div className="w-full h-px bg-zinc-800 my-1"></div>

                <button className="p-1.5 text-zinc-500 hover:text-zinc-300 group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-300 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-zinc-700">
                        Text Tool (T)
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
