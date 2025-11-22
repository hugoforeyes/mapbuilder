import { useState, useEffect } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import RightPanel from './components/RightPanel';
import TopBar from './components/TopBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';
import type { MapItem, ToolType } from './types';

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [terrainData, setTerrainData] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // New State for Reference Style UI
  const [brushSize, setBrushSize] = useState(100);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Calculate canvas size based on available space (approximate)
  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 40 // TopBar height
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateTerrain = (data: string) => {
    setTerrainData(data);
  };

  const handleAddItem = (item: MapItem) => {
    setItems((prev) => [...prev, item]);
    setSelectedItemId(item.id);
    setSelectedTool('select');
  };

  const handleUpdateItem = (id: string, newAttrs: Partial<MapItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newAttrs } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleClearMap = () => {
    if (window.confirm('Are you sure you want to clear the map?')) {
      setTerrainData(null);
      setItems([]);
    }
  };

  const handleSaveMap = () => {
    const mapData = {
      terrainData,
      items,
    };
    const blob = new Blob([JSON.stringify(mapData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fantasy-map.json';
    a.click();
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 overflow-hidden font-sans">
      <TopBar onSaveMap={handleSaveMap} onClearMap={handleClearMap} />

      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
        />

        <ToolOptionsPanel
          selectedTool={selectedTool}
          selectedAsset={selectedAsset}
          onOpenCatalog={() => setIsCatalogOpen(true)}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />

        <div className="flex-1 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
          <div className="shadow-2xl shadow-black">
            <MapCanvas
              width={canvasSize.width}
              height={canvasSize.height}
              terrainData={terrainData}
              items={items}
              selectedTool={selectedTool}
              selectedAsset={selectedAsset}
              onUpdateTerrain={handleUpdateTerrain}
              brushSize={brushSize}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onSelectItem={setSelectedItemId}
              selectedItemId={selectedItemId}
            />
          </div>
        </div>

        {/* Catalog / Right Panel Overlay */}
        {isCatalogOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 flex justify-end">
            <div className="w-96 h-full bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-700">
              <div className="flex justify-between items-center p-3 border-b border-zinc-700">
                <h2 className="font-semibold text-zinc-200">Asset Catalog</h2>
                <button onClick={() => setIsCatalogOpen(false)} className="text-zinc-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <RightPanel
                  selectedTool={selectedTool}
                  onSelectAsset={(asset) => {
                    setSelectedAsset(asset);
                    setIsCatalogOpen(false);
                  }}
                  selectedAsset={selectedAsset}
                  items={items}
                  onSelectItem={setSelectedItemId}
                  selectedItemId={selectedItemId}
                  onDeleteItem={handleDeleteItem}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
