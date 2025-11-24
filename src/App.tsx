import { useState } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import TopBar from './components/TopBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';
import CatalogOverlay from './components/CatalogOverlay';
import type { MapItem, ToolType, MaskSettings } from './types';

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [selectedBrushTexture, setSelectedBrushTexture] = useState<string | null>('/assets/background/FantasyWorld/core/asset_7.jpg');
  const [selectedItemAsset, setSelectedItemAsset] = useState<string | null>(null);
  const [terrainData, setTerrainData] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 2048, height: 1536 });

  // Mask Effects State
  const [maskEffectsEnabled, setMaskEffectsEnabled] = useState(false);
  const [maskEffectsSettings, setMaskEffectsSettings] = useState<MaskSettings>({
    stroke: { enabled: true, texture: null, width: 0.5, color: '#000000' },
    outline: { enabled: false, color: '#000000', width: 1 },
    shadows: {
      outer: { enabled: true, color: '#000000', blur: 10 },
      inner: { enabled: true, color: '#000000', blur: 10 }
    },
    ripples: { enabled: true, texture: null, width: 0.5, count: 3, gap: 1.5 }
  });

  // New State for Reference Style UI
  const [brushSize, setBrushSize] = useState(100);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushSoftness, setBrushSoftness] = useState(0);
  const [brushShape, setBrushShape] = useState<'circle' | 'rough'>('circle');
  const [brushRoughness, setBrushRoughness] = useState(8);
  const [brushSmooth, setBrushSmooth] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<'background' | 'foreground'>('foreground');
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
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleAssetSelection = (asset: string, { closeCatalog = false } = {}) => {
    if (selectedTool === 'brush') {
      setSelectedBrushTexture(asset);
      setSelectedBrushGroup(null);
    } else {
      setSelectedItemAsset(asset);
      setSelectedItemGroup(null);
    }

    if (closeCatalog) {
      setIsCatalogOpen(false);
    }
  };

  const handleGroupSelection = (group: string[]) => {
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
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          selectedGroup={selectedTool === 'brush' ? selectedBrushGroup : selectedItemGroup}
          onSelectAsset={handleAssetSelection}
          onClose={() => setSelectedTool('select')}
          itemPlacementMode={itemPlacementMode}
          setItemPlacementMode={setItemPlacementMode}
          isRandomPlacement={isRandomPlacement}
          setIsRandomPlacement={setIsRandomPlacement}
          maskEffectsEnabled={maskEffectsEnabled}
          setMaskEffectsEnabled={setMaskEffectsEnabled}
          maskEffectsSettings={maskEffectsSettings}
          setMaskEffectsSettings={setMaskEffectsSettings}
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
              selectedLayer={selectedLayer}
              itemPlacementMode={itemPlacementMode}
              isRandomPlacement={isRandomPlacement}
              selectedItemGroup={selectedItemGroup}
              onSelectAsset={handleAssetSelection}
              maskEffectsEnabled={maskEffectsEnabled}
              maskEffectsSettings={maskEffectsSettings}
            />
          </div>
        </div>

        <CatalogOverlay
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          selectedTool={selectedTool}
          selectedAsset={selectedTool === 'brush' ? selectedBrushTexture : selectedItemAsset}
          onSelectAsset={(asset) => handleAssetSelection(asset, { closeCatalog: true })}
          onSelectGroup={handleGroupSelection}
          items={items}
          onSelectItem={setSelectedItemId}
          selectedItemId={selectedItemId}
          onDeleteItem={handleDeleteItem}
        />
      </div>
    </div>
  );
}

export default App;
