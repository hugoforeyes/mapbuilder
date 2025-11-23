import { useState } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import RightPanel from './components/RightPanel';
import TopBar from './components/TopBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';
import type { MapItem, ToolType } from './types';

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedBrushTexture, setSelectedBrushTexture] = useState<string | null>(null);
  const [selectedItemAsset, setSelectedItemAsset] = useState<string | null>(null);
  const [terrainData, setTerrainData] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 2048, height: 1536 });

  // New State for Reference Style UI
  const [brushSize, setBrushSize] = useState(100);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushSoftness, setBrushSoftness] = useState(0.5);
  const [brushShape, setBrushShape] = useState<'circle' | 'rough'>('circle');
  const [brushRoughness, setBrushRoughness] = useState(8);
  const [brushSmooth, setBrushSmooth] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedBrushGroup, setSelectedBrushGroup] = useState<string[] | null>(null);
  const [selectedItemGroup, setSelectedItemGroup] = useState<string[] | null>(null);
  const [itemPlacementMode, setItemPlacementMode] = useState<'single' | 'multiple'>('single');
  const [isRandomPlacement, setIsRandomPlacement] = useState(true);

  // Removed auto-resize logic to keep fixed default size

  const handleUpdateTerrain = (data: string) => {
    setTerrainData(data);
  };

  const handleAddItem = (item: MapItem) => {
    setItems((prev) => [...prev, item]);
    setSelectedItemId(item.id);
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
          selectedAsset={selectedTool === 'brush' ? selectedBrushTexture : selectedItemAsset}
          onOpenCatalog={() => setIsCatalogOpen(true)}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushOpacity={brushOpacity}
          setBrushOpacity={setBrushOpacity}
          brushSoftness={brushSoftness}
          setBrushSoftness={setBrushSoftness}
          brushShape={brushShape}
          setBrushShape={setBrushShape}
          brushRoughness={brushRoughness}
          setBrushRoughness={setBrushRoughness}
          brushSmooth={brushSmooth}
          setBrushSmooth={setBrushSmooth}
          selectedGroup={selectedTool === 'brush' ? selectedBrushGroup : selectedItemGroup}
          onSelectAsset={(asset) => {
            if (selectedTool === 'brush') {
              setSelectedBrushTexture(asset);
            } else {
              setSelectedItemAsset(asset);
            }
          }}
          onClose={() => setSelectedTool('select')}
          itemPlacementMode={itemPlacementMode}
          setItemPlacementMode={setItemPlacementMode}
          isRandomPlacement={isRandomPlacement}
          setIsRandomPlacement={setIsRandomPlacement}
        />

        <div className="flex-1 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
          <div className="shadow-2xl shadow-black">
            <MapCanvas
              width={canvasSize.width}
              height={canvasSize.height}
              terrainData={terrainData}
              items={items}
              selectedTool={selectedTool}
              selectedAsset={selectedTool === 'brush' ? selectedBrushTexture : selectedItemAsset}
              onUpdateTerrain={handleUpdateTerrain}
              brushSize={brushSize}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onSelectItem={setSelectedItemId}
              selectedItemId={selectedItemId}
              brushOpacity={brushOpacity}
              brushSoftness={brushSoftness}
              brushShape={brushShape}
              brushRoughness={brushRoughness}
              brushSmooth={brushSmooth}
              itemPlacementMode={itemPlacementMode}
              isRandomPlacement={isRandomPlacement}
              selectedItemGroup={selectedItemGroup}
              onSelectAsset={setSelectedItemAsset}
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
                    if (selectedTool === 'brush') {
                      setSelectedBrushTexture(asset);
                      setSelectedBrushGroup(null);
                    } else if (selectedTool === 'item') {
                      setSelectedItemAsset(asset);
                      setSelectedItemGroup(null);
                    }
                    setIsCatalogOpen(false);
                  }}
                  // @ts-ignore
                  onSelectGroup={(group) => {
                    // Also select the first item by default if none selected
                    if (selectedTool === 'brush') {
                      setSelectedBrushGroup(group);
                      setSelectedBrushTexture(group[0]);
                    } else {
                      setSelectedItemGroup(group);
                      setSelectedItemAsset(group[0]);
                      setIsRandomPlacement(true);
                      setItemPlacementMode('multiple');
                    }
                    setIsCatalogOpen(false);
                  }}
                  selectedAsset={selectedTool === 'brush' ? selectedBrushTexture : selectedItemAsset}
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
