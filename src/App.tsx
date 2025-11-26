import { useEffect, useRef, useState } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import RightPanel from './components/RightPanel';
import TopBar from './components/TopBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';
import type { MapItem, ToolType, MaskSettings } from './types';

type Snapshot = {
  backgroundData: string | null;
  foregroundData: string | null;
  items: MapItem[];
};

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const previousToolRef = useRef<ToolType>('select');
  const [selectedBrushTexture, setSelectedBrushTexture] = useState<string | null>('/assets/background/FantasyWorld/core/asset_5.jpg');
  const [selectedItemAsset, setSelectedItemAsset] = useState<string | null>(null);
  const [backgroundData, setBackgroundData] = useState<string | null>(null);
  const [foregroundData, setForegroundData] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 2048, height: 1536 });

  // Mask Effects State
  const [maskEffectsEnabled, setMaskEffectsEnabled] = useState(true);
  const [maskEffectsSettings, setMaskEffectsSettings] = useState<MaskSettings>({
    stroke: { enabled: true, texture: null, width: 0.5, color: '#000000' },
    outline: { enabled: false, color: '#000000', width: 1 },
    shadows: {
      outer: { enabled: true, color: '#000000', blur: 10 },
      inner: { enabled: true, color: '#000000', blur: 10 }
    },
    ripples: { enabled: true, texture: null, width: 1.2, count: 9, gap: 1.7 }
  });

  // New State for Reference Style UI
  const [brushSize, setBrushSize] = useState(100);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [brushSoftness, setBrushSoftness] = useState(0);
  const [brushShape, setBrushShape] = useState<'circle' | 'rough'>('rough');
  const [brushRoughness, setBrushRoughness] = useState(8);
  const [brushSmooth, setBrushSmooth] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<'background' | 'foreground'>('foreground');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedBrushGroup, setSelectedBrushGroup] = useState<string[] | null>(null);
  const [selectedItemGroup, setSelectedItemGroup] = useState<string[] | null>(null);
  const [itemPlacementMode, setItemPlacementMode] = useState<'single' | 'multiple'>('single');
  const [isRandomPlacement, setIsRandomPlacement] = useState(true);
  const [maskAction, setMaskAction] = useState<'add' | 'subtract'>('add');
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const isRestoringRef = useRef(false);

  // Removed auto-resize logic to keep fixed default size

  const takeSnapshot = (): Snapshot => ({
    backgroundData,
    foregroundData,
    items
  });

  const pushUndo = () => {
    if (isRestoringRef.current) return;
    setUndoStack((prev) => {
      const snapshot = takeSnapshot();
      const last = prev[prev.length - 1];
      if (last && last.backgroundData === snapshot.backgroundData && last.foregroundData === snapshot.foregroundData && JSON.stringify(last.items) === JSON.stringify(snapshot.items)) {
        return prev;
      }
      return [...prev, snapshot];
    });
    setRedoStack([]);
  };

  const applySnapshot = (snapshot: Snapshot) => {
    isRestoringRef.current = true;
    setBackgroundData(snapshot.backgroundData);
    setForegroundData(snapshot.foregroundData);
    setItems(snapshot.items);
    setSelectedItemId(null);
    requestAnimationFrame(() => {
      isRestoringRef.current = false;
    });
  };

  const handleUpdateTerrain = (data: { background: string | null, foreground: string | null }) => {
    pushUndo();
    setBackgroundData(data.background);
    setForegroundData(data.foreground);
  };

  const handleAddItem = (item: MapItem) => {
    pushUndo();
    setItems((prev) => [...prev, item]);
    setSelectedItemId(item.id);
  };

  const handleUpdateItem = (id: string, newAttrs: Partial<MapItem>) => {
    pushUndo();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newAttrs } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    pushUndo();
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || target.isContentEditable || tag === 'select';
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault();
        if (selectedTool !== 'hand') {
          previousToolRef.current = selectedTool;
          setSelectedTool('hand');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setSelectedTool(previousToolRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedTool]);

  const undo = () => {
    setUndoStack((prevUndo) => {
      if (prevUndo.length === 0) return prevUndo;
      setRedoStack((prevRedo) => [...prevRedo, takeSnapshot()]);
      const nextUndo = [...prevUndo];
      const last = nextUndo.pop()!;
      applySnapshot(last);
      return nextUndo;
    });
  };

  const redo = () => {
    setRedoStack((prevRedo) => {
      if (prevRedo.length === 0) return prevRedo;
      setUndoStack((prevUndo) => [...prevUndo, takeSnapshot()]);
      const nextRedo = [...prevRedo];
      const last = nextRedo.pop()!;
      applySnapshot(last);
      return nextRedo;
    });
  };

  const handleClearMap = () => {
    if (window.confirm('Are you sure you want to clear the map?')) {
      pushUndo();
      setBackgroundData(null);
      setForegroundData(null);
      setItems([]);
    }
  };

  const handleSaveMap = () => {
    const mapData = {
      backgroundData,
      foregroundData,
      items,
    };
    const blob = new Blob([JSON.stringify(mapData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fantasy-map.json';
    a.click();
  };

  const handleLoadMap = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed) {
            pushUndo();
            if (typeof parsed.backgroundData === 'string' || parsed.backgroundData === null) {
              setBackgroundData(parsed.backgroundData || null);
            } else if (typeof parsed.terrainData === 'string') {
              // Legacy support: treat combined data as background if provided
              setBackgroundData(parsed.terrainData);
            }
            if (typeof parsed.foregroundData === 'string' || parsed.foregroundData === null) {
              setForegroundData(parsed.foregroundData || null);
            }
            if (Array.isArray(parsed.items)) {
              setItems(parsed.items);
            }
            setSelectedItemId(null);
          }
        } catch (err) {
          console.error('Failed to load map file', err);
          alert('Could not load map. Please ensure the file is a valid map JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 overflow-hidden font-sans">
      <TopBar
        onSaveMap={handleSaveMap}
        onLoadMap={handleLoadMap}
        onClearMap={handleClearMap}
        onUndo={undo}
        onRedo={redo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
        />

        <ToolOptionsPanel
          selectedTool={selectedTool}
          selectedAsset={selectedTool === 'brush' || selectedTool === 'mask' ? selectedBrushTexture : selectedItemAsset}
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
          selectedGroup={(selectedTool === 'brush' || selectedTool === 'mask') ? selectedBrushGroup : selectedItemGroup}
          onSelectAsset={(asset) => {
            if (selectedTool === 'brush' || selectedTool === 'mask') {
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
          maskEffectsEnabled={maskEffectsEnabled}
          setMaskEffectsEnabled={setMaskEffectsEnabled}
          maskEffectsSettings={maskEffectsSettings}
          setMaskEffectsSettings={setMaskEffectsSettings}
          maskAction={maskAction}
          setMaskAction={setMaskAction}
        />

        <div className="flex-1 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
          <div className="shadow-2xl shadow-black">
            <MapCanvas
              width={canvasSize.width}
              height={canvasSize.height}
              backgroundData={backgroundData}
              foregroundData={foregroundData}
              items={items}
              selectedTool={selectedTool}
              selectedAsset={(selectedTool === 'brush' || selectedTool === 'mask') ? selectedBrushTexture : selectedItemAsset}
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
              onSelectAsset={setSelectedItemAsset}
              maskEffectsEnabled={maskEffectsEnabled}
              maskEffectsSettings={maskEffectsSettings}
              maskAction={maskAction}
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
                    if (selectedTool === 'brush' || selectedTool === 'mask') {
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
                    if (selectedTool === 'brush' || selectedTool === 'mask') {
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
                  selectedAsset={(selectedTool === 'brush' || selectedTool === 'mask') ? selectedBrushTexture : selectedItemAsset}
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
