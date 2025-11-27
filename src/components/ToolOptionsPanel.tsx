import React, { useState } from 'react';
import type { ToolType, MaskSettings } from '../types';
import BrushOptions from './tool-options/BrushOptions';
import MaskOptions from './tool-options/MaskOptions';
import ItemOptions from './tool-options/ItemOptions';
import TextOptions from './tool-options/TextOptions';

interface ToolOptionsPanelProps {
    selectedTool: ToolType;
    selectedAsset: string | null;
    onOpenCatalog: () => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    brushOpacity: number;
    setBrushOpacity: (opacity: number) => void;
    itemOpacity: number;
    setItemOpacity: (opacity: number) => void;
    textValue: string;
    setTextValue: (value: string) => void;
    textFontFamily: string;
    setTextFontFamily: (font: string) => void;
    textFontSize: number;
    setTextFontSize: (size: number) => void;
    textFill: string;
    setTextFill: (color: string) => void;
    textOpacity: number;
    setTextOpacity: (opacity: number) => void;
    textStrokeEnabled: boolean;
    setTextStrokeEnabled: (enabled: boolean) => void;
    textStrokeColor: string;
    setTextStrokeColor: (color: string) => void;
    textStrokeAlpha: number;
    setTextStrokeAlpha: (alpha: number) => void;
    textStrokeWidth: number;
    setTextStrokeWidth: (width: number) => void;
    textShadowEnabled: boolean;
    setTextShadowEnabled: (enabled: boolean) => void;
    textShadowColor: string;
    setTextShadowColor: (color: string) => void;
    textShadowBlur: number;
    setTextShadowBlur: (blur: number) => void;
    textShadowOffsetX: number;
    setTextShadowOffsetX: (offset: number) => void;
    textShadowOffsetY: number;
    setTextShadowOffsetY: (offset: number) => void;
    textShadowOpacity: number;
    setTextShadowOpacity: (opacity: number) => void;
    textAlign: 'left' | 'center' | 'right';
    setTextAlign: (align: 'left' | 'center' | 'right') => void;
    textLetterSpacing: number;
    setTextLetterSpacing: (spacing: number) => void;
    textLineHeight: number;
    setTextLineHeight: (lineHeight: number) => void;
    brushSoftness: number;
    setBrushSoftness: (softness: number) => void;
    brushShape: 'circle' | 'rough';
    setBrushShape: (shape: 'circle' | 'rough') => void;
    brushRoughness: number;
    setBrushRoughness: (roughness: number) => void;
    brushSmooth: boolean;
    setBrushSmooth: (smooth: boolean) => void;
    selectedLayer?: 'background' | 'foreground';
    setSelectedLayer?: (layer: 'background' | 'foreground') => void;
    selectedGroup?: string[] | null;
    onSelectAsset?: (asset: string) => void;
    onClose: () => void;
    itemPlacementMode?: 'single' | 'multiple';
    setItemPlacementMode?: (mode: 'single' | 'multiple') => void;
    isRandomPlacement?: boolean;
    setIsRandomPlacement?: (isRandom: boolean) => void;
    maskEffectsEnabled?: boolean;
    setMaskEffectsEnabled?: (enabled: boolean) => void;
    maskEffectsSettings?: MaskSettings;
    setMaskEffectsSettings?: (settings: MaskSettings) => void;
    maskAction?: 'add' | 'subtract';
    setMaskAction?: (mode: 'add' | 'subtract') => void;
    selectedItemId?: string | null;
}

const ToolOptionsPanel: React.FC<ToolOptionsPanelProps> = ({
    selectedTool,
    selectedAsset,
    onOpenCatalog,
    brushSize,
    setBrushSize,
    brushOpacity,
    setBrushOpacity,
    itemOpacity,
    setItemOpacity,
    textValue,
    setTextValue,
    textFontFamily,
    setTextFontFamily,
    textFontSize,
    setTextFontSize,
    textFill,
    setTextFill,
    textOpacity,
    setTextOpacity,
    textStrokeEnabled,
    setTextStrokeEnabled,
    textStrokeColor,
    setTextStrokeColor,
    textStrokeAlpha,
    setTextStrokeAlpha,
    textStrokeWidth,
    setTextStrokeWidth,
    textShadowEnabled,
    setTextShadowEnabled,
    textShadowColor,
    setTextShadowColor,
    textShadowBlur,
    setTextShadowBlur,
    textShadowOffsetX,
    setTextShadowOffsetX,
    textShadowOffsetY,
    setTextShadowOffsetY,
    textShadowOpacity,
    setTextShadowOpacity,
    textAlign,
    setTextAlign,
    textLetterSpacing,
    setTextLetterSpacing,
    textLineHeight,
    setTextLineHeight,
    brushSoftness,
    setBrushSoftness,
    brushShape,
    setBrushShape,
    brushRoughness,
    setBrushRoughness,
    brushSmooth,
    setBrushSmooth,
    selectedLayer,
    setSelectedLayer,
    selectedGroup,
    onSelectAsset,
    onClose,
    itemPlacementMode,
    setItemPlacementMode,
    isRandomPlacement,
    setIsRandomPlacement,
    maskEffectsEnabled,
    setMaskEffectsEnabled,
    maskEffectsSettings,
    setMaskEffectsSettings,
    maskAction = 'add',
    setMaskAction,
    selectedItemId,
}) => {
    const [isMaskSettingsOpen, setIsMaskSettingsOpen] = useState(false);

    if (selectedTool === 'select' || selectedTool === 'hand') return null;

    const title = selectedTool === 'brush'
        ? 'Brush Tool'
        : selectedTool === 'mask'
            ? 'Mask Tool'
            : selectedTool === 'item'
                ? 'Item Tool'
                : 'Text Tool';

    return (
        <div className="absolute left-10 w-64 max-h-[calc(100vh-2.5rem)] bg-zinc-900 border border-gold-500/30 rounded shadow-xl flex flex-col text-zinc-300 select-none z-40 font-fantasy overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gold-500/30 bg-zinc-950 rounded-t">
                <span className="font-semibold text-sm text-gold-400 tracking-wider">
                    {title}
                </span>
                <button
                    className="text-zinc-500 hover:text-gold-400 transition-colors"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-3 space-y-4 font-sans overflow-y-auto">
                {selectedTool === 'brush' && (
                    <BrushOptions
                        selectedLayer={selectedLayer}
                        setSelectedLayer={setSelectedLayer}
                        selectedGroup={selectedGroup}
                        selectedAsset={selectedAsset}
                        onSelectAsset={onSelectAsset}
                        onOpenCatalog={onOpenCatalog}
                        brushShape={brushShape}
                        setBrushShape={setBrushShape}
                        brushSize={brushSize}
                        setBrushSize={setBrushSize}
                        brushOpacity={brushOpacity}
                        setBrushOpacity={setBrushOpacity}
                        brushSoftness={brushSoftness}
                        setBrushSoftness={setBrushSoftness}
                        brushRoughness={brushRoughness}
                        setBrushRoughness={setBrushRoughness}
                        brushSmooth={brushSmooth}
                        setBrushSmooth={setBrushSmooth}
                    />
                )}

                {selectedTool === 'mask' && (
                    <MaskOptions
                        maskEffectsEnabled={maskEffectsEnabled}
                        setMaskEffectsEnabled={setMaskEffectsEnabled}
                        maskEffectsSettings={maskEffectsSettings}
                        setMaskEffectsSettings={setMaskEffectsSettings}
                        maskAction={maskAction}
                        setMaskAction={setMaskAction}
                        isMaskSettingsOpen={isMaskSettingsOpen}
                        setIsMaskSettingsOpen={setIsMaskSettingsOpen}
                        selectedGroup={selectedGroup}
                        selectedAsset={selectedAsset}
                        onSelectAsset={onSelectAsset}
                        onOpenCatalog={onOpenCatalog}
                        brushShape={brushShape}
                        setBrushShape={setBrushShape}
                        brushSize={brushSize}
                        setBrushSize={setBrushSize}
                        brushRoughness={brushRoughness}
                        setBrushRoughness={setBrushRoughness}
                        brushSmooth={brushSmooth}
                        setBrushSmooth={setBrushSmooth}
                    />
                )}

                {selectedTool === 'item' && (
                    <ItemOptions
                        selectedGroup={selectedGroup}
                        selectedAsset={selectedAsset}
                        onSelectAsset={onSelectAsset}
                        onOpenCatalog={onOpenCatalog}
                        itemPlacementMode={itemPlacementMode}
                        setItemPlacementMode={setItemPlacementMode}
                        isRandomPlacement={isRandomPlacement}
                        setIsRandomPlacement={setIsRandomPlacement}
                        brushSize={brushSize}
                        setBrushSize={setBrushSize}
                        itemOpacity={itemOpacity}
                        setItemOpacity={setItemOpacity}
                    />
                )}

                {selectedTool === 'text' && (
                    <TextOptions
                        textValue={textValue}
                        setTextValue={setTextValue}
                        textFontFamily={textFontFamily}
                        setTextFontFamily={setTextFontFamily}
                        textFontSize={textFontSize}
                        setTextFontSize={setTextFontSize}
                        textFill={textFill}
                        setTextFill={setTextFill}
                        textOpacity={textOpacity}
                        setTextOpacity={setTextOpacity}
                        textStrokeEnabled={textStrokeEnabled}
                        setTextStrokeEnabled={setTextStrokeEnabled}
                        textStrokeColor={textStrokeColor}
                        setTextStrokeColor={setTextStrokeColor}
                        textStrokeAlpha={textStrokeAlpha}
                        setTextStrokeAlpha={setTextStrokeAlpha}
                        textStrokeWidth={textStrokeWidth}
                        setTextStrokeWidth={setTextStrokeWidth}
                        textShadowEnabled={textShadowEnabled}
                        setTextShadowEnabled={setTextShadowEnabled}
                        textShadowColor={textShadowColor}
                        setTextShadowColor={setTextShadowColor}
                        textShadowBlur={textShadowBlur}
                        setTextShadowBlur={setTextShadowBlur}
                        textShadowOffsetX={textShadowOffsetX}
                        setTextShadowOffsetX={setTextShadowOffsetX}
                        textShadowOffsetY={textShadowOffsetY}
                        setTextShadowOffsetY={setTextShadowOffsetY}
                        textShadowOpacity={textShadowOpacity}
                        setTextShadowOpacity={setTextShadowOpacity}
                        textAlign={textAlign}
                        setTextAlign={setTextAlign}
                        textLetterSpacing={textLetterSpacing}
                        setTextLetterSpacing={setTextLetterSpacing}
                        textLineHeight={textLineHeight}
                        setTextLineHeight={setTextLineHeight}
                        selectedItemId={selectedItemId}
                    />
                )}
            </div>
        </div>
    );
};

export default ToolOptionsPanel;
