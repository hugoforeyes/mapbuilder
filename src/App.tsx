import { useEffect, useRef, useState } from 'react';
import MapCanvas from './components/MapCanvas';
import Toolbar from './components/Toolbar';
import RightPanel from './components/RightPanel';
import TopBar from './components/TopBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';
import type { MapElement, MapItem, MapText, ToolType, MaskSettings } from './types';

type Snapshot = {
  backgroundData: string | null;
  foregroundData: string | null;
  items: MapElement[];
};

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const previousToolRef = useRef<ToolType>('select');
  const [selectedBrushTexture, setSelectedBrushTexture] = useState<string | null>('/assets/background/FantasyWorld/core/asset_5.jpg');
  const [selectedItemAsset, setSelectedItemAsset] = useState<string | null>(null);
  const [backgroundData, setBackgroundData] = useState<string | null>(null);
  const [foregroundData, setForegroundData] = useState<string | null>(null);
  const [items, setItems] = useState<MapElement[]>([]);
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
  const [itemOpacity, setItemOpacity] = useState(1);
  const [selectedLayer, setSelectedLayer] = useState<'background' | 'foreground'>('foreground');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedBrushGroup, setSelectedBrushGroup] = useState<string[] | null>(null);
  const [selectedItemGroup, setSelectedItemGroup] = useState<string[] | null>(null);
  const [itemPlacementMode, setItemPlacementMode] = useState<'single' | 'multiple'>('single');
  const [isRandomPlacement, setIsRandomPlacement] = useState(true);
  const [maskAction, setMaskAction] = useState<'add' | 'subtract'>('add');
  const [textValue, setTextValue] = useState('Text');
  const [textFontFamily, setTextFontFamily] = useState('IM Fell English SC, serif');
  const [textFontSize, setTextFontSize] = useState(24);
  const [textFill, setTextFill] = useState('#ffffff');
  const [textOpacity, setTextOpacity] = useState(0.9);
  const [textStrokeEnabled, setTextStrokeEnabled] = useState(true);
  const [textStrokeColor, setTextStrokeColor] = useState('#000000');
  const [textStrokeAlpha, setTextStrokeAlpha] = useState(0.85);
  const [textStrokeWidth, setTextStrokeWidth] = useState(0.5);
  const [textShadowEnabled, setTextShadowEnabled] = useState(false);
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [textShadowBlur, setTextShadowBlur] = useState(6);
  const [textShadowOffsetX, setTextShadowOffsetX] = useState(0);
  const [textShadowOffsetY, setTextShadowOffsetY] = useState(0);
  const [textShadowOpacity, setTextShadowOpacity] = useState(0.6);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [textLetterSpacing, setTextLetterSpacing] = useState(0);
  const [textLineHeight, setTextLineHeight] = useState(1);
  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized.padEnd(6, '0');
    const int = parseInt(full.slice(0, 6), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
  };
  const applyLiveTextUpdate = (attrs: Partial<Omit<MapText, 'type'>>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.type !== 'text' || item.id !== selectedItemId) return item;
        const updated: MapText = { ...item, ...attrs };
        return updated;
      })
    );
  };
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

  const handleAddItem = (item: MapElement) => {
    pushUndo();
    setItems((prev) => [...prev, item]);
    setSelectedItemId(item.id);
  };

  const handleUpdateItem = (id: string, newAttrs: Partial<MapElement>) => {
    pushUndo();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.type === 'text') {
          return { ...item, ...(newAttrs as Partial<MapText>) };
        }
        return { ...item, ...(newAttrs as Partial<MapItem>) };
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    pushUndo();
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedItemId(id);
    if (!id) return;
    const element = items.find((el) => el.id === id);
    if (!element) return;
    if (element.type === 'text') {
      setSelectedTool('text');
    } else if (element.type === 'item') {
      setSelectedTool('item');
    }
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
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (isTypingTarget(e.target)) return;
        if (selectedItemId) {
          handleDeleteItem(selectedItemId);
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
          itemOpacity={itemOpacity}
          setItemOpacity={setItemOpacity}
          textValue={textValue}
          setTextValue={(value) => {
            setTextValue(value);
            applyLiveTextUpdate({ text: value });
          }}
          textFontFamily={textFontFamily}
          setTextFontFamily={(font) => {
            setTextFontFamily(font);
            applyLiveTextUpdate({ fontFamily: font });
          }}
          textFontSize={textFontSize}
          setTextFontSize={(size) => {
            setTextFontSize(size);
            applyLiveTextUpdate({ fontSize: size });
          }}
          textFill={textFill}
          setTextFill={(color) => {
            setTextFill(color);
            applyLiveTextUpdate({ fill: color });
          }}
          textOpacity={textOpacity}
          setTextOpacity={(opacity) => {
            setTextOpacity(opacity);
            applyLiveTextUpdate({ opacity });
          }}
          textStrokeEnabled={textStrokeEnabled}
          setTextStrokeEnabled={(enabled) => {
            setTextStrokeEnabled(enabled);
            applyLiveTextUpdate({ strokeEnabled: enabled });
          }}
          textStrokeColor={textStrokeColor}
          setTextStrokeColor={(color) => {
            setTextStrokeColor(color);
            applyLiveTextUpdate({ stroke: hexToRgba(color, textStrokeAlpha) });
          }}
          textStrokeAlpha={textStrokeAlpha}
          setTextStrokeAlpha={(alpha) => {
            setTextStrokeAlpha(alpha);
            applyLiveTextUpdate({ stroke: hexToRgba(textStrokeColor, alpha) });
          }}
          textStrokeWidth={textStrokeWidth}
          setTextStrokeWidth={(width) => {
            setTextStrokeWidth(width);
            applyLiveTextUpdate({ strokeWidth: width });
          }}
          textShadowEnabled={textShadowEnabled}
          setTextShadowEnabled={(enabled) => {
            setTextShadowEnabled(enabled);
            applyLiveTextUpdate({ shadowEnabled: enabled });
          }}
          textShadowColor={textShadowColor}
          setTextShadowColor={(color) => {
            setTextShadowColor(color);
            applyLiveTextUpdate({ shadowColor: color });
          }}
          textShadowBlur={textShadowBlur}
          setTextShadowBlur={(blur) => {
            setTextShadowBlur(blur);
            applyLiveTextUpdate({ shadowBlur: blur });
          }}
          textShadowOffsetX={textShadowOffsetX}
          setTextShadowOffsetX={(offset) => {
            setTextShadowOffsetX(offset);
            applyLiveTextUpdate({ shadowOffsetX: offset });
          }}
          textShadowOffsetY={textShadowOffsetY}
          setTextShadowOffsetY={(offset) => {
            setTextShadowOffsetY(offset);
            applyLiveTextUpdate({ shadowOffsetY: offset });
          }}
          textShadowOpacity={textShadowOpacity}
          setTextShadowOpacity={(opacity) => {
            setTextShadowOpacity(opacity);
            applyLiveTextUpdate({ shadowOpacity: opacity });
          }}
          textAlign={textAlign}
          setTextAlign={(align) => {
            setTextAlign(align);
            applyLiveTextUpdate({ align });
          }}
          textLetterSpacing={textLetterSpacing}
          setTextLetterSpacing={(spacing) => {
            setTextLetterSpacing(spacing);
            applyLiveTextUpdate({ letterSpacing: spacing });
          }}
          textLineHeight={textLineHeight}
          setTextLineHeight={(lineHeight) => {
            setTextLineHeight(lineHeight);
            applyLiveTextUpdate({ lineHeight });
          }}
          selectedItemId={selectedItemId}
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
              onSelectItem={handleSelectElement}
              selectedItemId={selectedItemId}
              brushOpacity={brushOpacity}
              itemOpacity={itemOpacity}
              textOptions={{
                text: textValue,
                fontFamily: textFontFamily,
                fontSize: textFontSize,
                fill: textFill,
                opacity: textOpacity,
                strokeEnabled: textStrokeEnabled,
                stroke: textStrokeColor,
                strokeWidth: textStrokeWidth,
                shadowEnabled: textShadowEnabled,
                shadowColor: textShadowColor,
                shadowBlur: textShadowBlur,
                shadowOffsetX: textShadowOffsetX,
                shadowOffsetY: textShadowOffsetY,
                shadowOpacity: textShadowOpacity,
                align: textAlign,
                letterSpacing: textLetterSpacing,
                lineHeight: textLineHeight,
              }}
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
                  onSelectItem={handleSelectElement}
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
