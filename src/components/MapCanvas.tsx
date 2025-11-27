import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Circle, Text as KonvaText, Rect } from 'react-konva';
import useImage from 'use-image';
import type { MapElement, MapItem, ToolType } from '../types';
import Konva from 'konva';
import type { TerrainLayerRef } from './TerrainLayer';
import TerrainLayer from './TerrainLayer';
import type { MaskSettings } from '../types';

interface MapCanvasProps {
    width: number;
    height: number;
    backgroundData: string | null;
    foregroundData: string | null;
    items: MapElement[];
    selectedTool: ToolType;
    selectedAsset: string | null;
    onUpdateTerrain: (data: { background: string | null, foreground: string | null }) => void;
    brushSize: number;
    onAddItem: (item: MapElement) => void;
    onUpdateItem: (id: string, newAttrs: Partial<MapElement>) => void;
    onSelectItem: (id: string | null) => void;
    selectedItemId: string | null;
    brushOpacity: number;
    itemOpacity: number;
    textOptions: {
        text: string;
        fontFamily: string;
        fontSize: number;
        fill: string;
        opacity: number;
        strokeEnabled: boolean;
        stroke: string;
        strokeWidth: number;
        shadowEnabled: boolean;
        shadowColor: string;
        shadowBlur: number;
        shadowOffsetX: number;
        shadowOffsetY: number;
        shadowOpacity: number;
        align: 'left' | 'center' | 'right';
        letterSpacing: number;
        lineHeight: number;
    };
    brushSoftness: number;
    brushShape: 'circle' | 'rough';
    brushRoughness: number;
    brushSmooth: boolean;
    selectedLayer?: 'background' | 'foreground';
    itemPlacementMode?: 'single' | 'multiple';
    isRandomPlacement?: boolean;
    selectedItemGroup?: string[] | null;
    onSelectAsset?: (asset: string) => void;
    maskEffectsEnabled?: boolean;
    maskEffectsSettings?: MaskSettings;
    maskAction?: 'add' | 'subtract';
}

const URLImage = ({ src, ...props }: any) => {
    const [image] = useImage(src);
    return <KonvaImage image={image} {...props} />;
};

const BrushCursor = ({ x, y, radius, src }: { x: number; y: number; radius: number; src: string | null }) => {
    const [image] = useImage(src || '');

    if (!src || !image) {
        return (
            <Circle
                x={x}
                y={y}
                radius={radius}
                stroke="black"
                strokeWidth={1}
                listening={false}
                opacity={0.8}
            />
        );
    }

    return (
        <Circle
            x={x}
            y={y}
            radius={radius}
            stroke="black"
            strokeWidth={1}
            fillPatternImage={image}
            fillPatternOffset={{ x: x, y: y }} // Offset pattern to align with world coordinates
            fillPatternScale={{ x: 1, y: 1 }}
            listening={false}
            opacity={0.8}
        />
    );
};

const ItemCursor = ({ x, y, src, size, opacity }: { x: number; y: number; src: string | null, size: number, opacity: number }) => {
    const [image] = useImage(src || '');

    if (!src || !image) return null;

    return (
        <KonvaImage
            image={image}
            x={x}
            y={y}
            width={size}
            height={size}
            offsetX={size / 2}
            offsetY={size / 2}
            opacity={opacity}
            listening={false}
        />
    );
};

const MapCanvas: React.FC<MapCanvasProps> = ({
    width,
    height,
    backgroundData,
    foregroundData,
    items,
    selectedTool,
    selectedAsset,
    onUpdateTerrain,
    brushSize,
    onAddItem,
    onUpdateItem,
    onSelectItem,
    selectedItemId,
    brushOpacity,
    itemOpacity,
    textOptions,
    brushSoftness,
    brushShape,
    brushRoughness,
    brushSmooth,
    selectedLayer = 'foreground',
    itemPlacementMode = 'single',
    isRandomPlacement,
    selectedItemGroup,
    onSelectAsset,
    maskEffectsEnabled,
    maskEffectsSettings,
    maskAction = 'add',
}) => {
    const stageRef = useRef<Konva.Stage>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const terrainLayerRef = useRef<TerrainLayerRef>(null);
    const itemsLayerRef = useRef<Konva.Layer>(null);
    const cursorLayerRef = useRef<Konva.Layer>(null);
    const isPainting = useRef(false);
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

    const lastPaintPos = useRef<{ x: number; y: number } | null>(null);
    const imageItems = items.filter((item): item is MapItem => item.type === 'item');

    const getWorldPointerPosition = (stage: Konva.Stage) => {
        const pointer = stage.getPointerPosition();
        if (!pointer) return null;
        const scale = stage.scaleX();
        return {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };
    };

    useEffect(() => {
        if (selectedItemId && trRef.current && stageRef.current) {
            // We need to wait for the node to be rendered
            const node = stageRef.current.findOne('#' + selectedItemId);
            if (node) {
                trRef.current.nodes([node]);
                trRef.current.getLayer()?.batchDraw();
            } else {
                // If node not found yet (e.g. first render), try again in next tick or just clear
                // React Konva usually handles this if we rely on re-renders, but with manual node setting we might need to be careful.
                // For now, let's clear if not found, but it should be found if rendered.
                trRef.current.nodes([]);
            }
        } else if (trRef.current) {
            trRef.current.nodes([]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [selectedItemId, items]); // Depend on items to retry if item added

    // Keep items rendered above any terrain/foreground content
    useEffect(() => {
        itemsLayerRef.current?.moveToTop();
        cursorLayerRef.current?.moveToTop(); // Cursor stays above items
    }, [items.length]);

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        setStageScale(newScale);
        setStagePos({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    };

    const subtractTexture = '/assets/background/FantasyWorld/water/asset_14.jpg';

    const getEffectiveAsset = () => {
        if (selectedTool === 'mask' && maskAction === 'subtract') {
            return subtractTexture;
        }
        return selectedAsset;
    };

    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const effectiveAsset = getEffectiveAsset();

        if ((selectedTool === 'brush' || selectedTool === 'mask') && effectiveAsset) {
            isPainting.current = true;
            if (terrainLayerRef.current) {
                terrainLayerRef.current.setInteractive(true);
            }
            const pos = getWorldPointerPosition(stage);
            if (pos && terrainLayerRef.current) {
                const layerToPaint = selectedTool === 'mask' ? 'foreground' : selectedLayer;
                terrainLayerRef.current.paint(pos.x, pos.y, brushSize, effectiveAsset, layerToPaint, brushOpacity, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, selectedTool === 'mask', maskAction);
                if (selectedTool === 'mask' && maskAction === 'subtract') {
                    const backgroundBrushSize = brushSize * 2;
                    terrainLayerRef.current.paint(pos.x, pos.y, backgroundBrushSize, subtractTexture, 'background', 1, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, false);
                }
                lastPaintPos.current = pos;
            }
        } else if (selectedTool === 'item' && selectedAsset && itemPlacementMode === 'multiple') {
            isPainting.current = true;
            const pos = getWorldPointerPosition(stage);
            if (pos) {
                onAddItem({
                    id: `item-${Date.now()}`,
                    type: 'item',
                    src: selectedAsset,
                    x: pos.x - (brushSize / 2),
                    y: pos.y - (brushSize / 2),
                    width: brushSize,
                    height: brushSize,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1,
                    opacity: itemOpacity,
                });
                lastPaintPos.current = pos;
            }
        } else if (selectedTool === 'select' && e.target === stage) {
            const pos = getWorldPointerPosition(stage);
            if (pos) {
                selectionStartRef.current = pos;
                setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
            }
        }
    };

    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        // Update cursor position for brush and item tools
        if (selectedTool === 'brush' || selectedTool === 'mask' || (selectedTool === 'item' && selectedAsset)) {
            const pos = getWorldPointerPosition(stage);
            if (pos) {
                setCursorPos(pos);
            }
        } else {
            if (cursorPos) setCursorPos(null);
        }

        if (selectedTool === 'select' && selectionStartRef.current && e.target === stage) {
            const pos = getWorldPointerPosition(stage);
            if (pos) {
                const start = selectionStartRef.current;
                const rectX = Math.min(start.x, pos.x);
                const rectY = Math.min(start.y, pos.y);
                const rectW = Math.abs(pos.x - start.x);
                const rectH = Math.abs(pos.y - start.y);
                setSelectionRect({ x: rectX, y: rectY, width: rectW, height: rectH });
            }
        }

        if (!isPainting.current) return;

        const effectiveAsset = getEffectiveAsset();

        if ((selectedTool === 'brush' || selectedTool === 'mask') && effectiveAsset) {
            const pos = getWorldPointerPosition(stage);
            if (pos && terrainLayerRef.current) {
                // Calculate distance from last paint position
                if (lastPaintPos.current) {
                    const dx = pos.x - lastPaintPos.current.x;
                    const dy = pos.y - lastPaintPos.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only paint if moved enough (spacing)
                    // For rough brush, we need more spacing to preserve the rough look
                    // For circle brush, we can use smaller spacing for smoother lines
                    const spacing = brushShape === 'rough' ? brushSize * 0.25 : brushSize * 0.1;

                    if (distance >= spacing) {
                        const layerToPaint = selectedTool === 'mask' ? 'foreground' : selectedLayer;
                        terrainLayerRef.current.paint(pos.x, pos.y, brushSize, effectiveAsset, layerToPaint, brushOpacity, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, selectedTool === 'mask', maskAction);
                        if (selectedTool === 'mask' && maskAction === 'subtract') {
                            const backgroundBrushSize = brushSize * 2;
                            terrainLayerRef.current.paint(pos.x, pos.y, backgroundBrushSize, subtractTexture, 'background', 1, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, false);
                        }
                        lastPaintPos.current = pos;
                    }
                } else {
                    // First paint (should have been handled by mousedown but just in case)
                    const layerToPaint = selectedTool === 'mask' ? 'foreground' : selectedLayer;
                    terrainLayerRef.current.paint(pos.x, pos.y, brushSize, effectiveAsset, layerToPaint, brushOpacity, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, selectedTool === 'mask', maskAction);
                    if (selectedTool === 'mask' && maskAction === 'subtract') {
                        const backgroundBrushSize = brushSize * 2;
                        terrainLayerRef.current.paint(pos.x, pos.y, backgroundBrushSize, subtractTexture, 'background', 1, brushShape === 'rough' ? 0 : brushSoftness, undefined, brushShape, brushRoughness, brushSmooth, false);
                    }
                    lastPaintPos.current = pos;
                }
            }
        } else if (selectedTool === 'item' && selectedAsset && itemPlacementMode === 'multiple') {
            const pos = getWorldPointerPosition(stage);
            if (pos) {
                // Determine which asset to place
                let assetToPlace = selectedAsset;
                if (isRandomPlacement && selectedItemGroup && selectedItemGroup.length > 0) {
                    const randomIndex = Math.floor(Math.random() * selectedItemGroup.length);
                    assetToPlace = selectedItemGroup[randomIndex];
                }

                if (lastPaintPos.current) {
                    const dx = pos.x - lastPaintPos.current.x;
                    const dy = pos.y - lastPaintPos.current.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Spacing for items - use brushSize as spacing to avoid too much overlap
                    const spacing = brushSize * 0.8;

                    if (distance >= spacing) {
                        // Check for collision with existing items
                        const hasCollision = imageItems.some(item => {
                            const itemDx = pos.x - item.x;
                            const itemDy = pos.y - item.y;
                            const itemDist = Math.sqrt(itemDx * itemDx + itemDy * itemDy);
                            // Simple collision: if distance is less than average radius * factor
                            // Assuming item.width is roughly the size
                            return itemDist < (brushSize / 2 + item.width / 2) * 0.6;
                        });

                        if (!hasCollision) {
                            onAddItem({
                                id: `item-${Date.now()}`,
                                type: 'item',
                                src: assetToPlace,
                                x: pos.x - (brushSize / 2),
                                y: pos.y - (brushSize / 2),
                                width: brushSize,
                                height: brushSize,
                                rotation: 0,
                                scaleX: 1,
                                scaleY: 1,
                                opacity: itemOpacity,
                            });
                            if (isRandomPlacement) {
                                onSelectAsset?.(assetToPlace);
                            }
                            lastPaintPos.current = pos;
                        }
                    }
                } else {
                    // Check for collision with existing items
                    const hasCollision = imageItems.some(item => {
                        const itemDx = pos.x - item.x;
                        const itemDy = pos.y - item.y;
                        const itemDist = Math.sqrt(itemDx * itemDx + itemDy * itemDy);
                        return itemDist < (brushSize / 2 + item.width / 2) * 0.6;
                    });

                    if (!hasCollision) {
                        onAddItem({
                            id: `item-${Date.now()}`,
                            type: 'item',
                            src: assetToPlace,
                            x: pos.x - (brushSize / 2),
                            y: pos.y - (brushSize / 2),
                            width: brushSize,
                            height: brushSize,
                            rotation: 0,
                            scaleX: 1,
                            scaleY: 1,
                            opacity: itemOpacity,
                        });
                        if (isRandomPlacement) {
                            onSelectAsset?.(assetToPlace);
                        }
                        lastPaintPos.current = pos;
                    }
                }
            }
        }
    };

    const handleStageMouseUp = () => {
        if (selectedTool === 'select' && selectionStartRef.current) {
            const stage = stageRef.current;
            if (stage && selectionRect) {
                const scale = stage.scaleX();
                const stageX = stage.x();
                const stageY = stage.y();
                const selWorld = selectionRect;
                const nodes = itemsLayerRef.current?.find('Image,Text') || [];
                const selectedIds: string[] = [];
                nodes.forEach((node: any) => {
                    const box = node.getClientRect();
                    const worldBox = {
                        x: (box.x - stageX) / scale,
                        y: (box.y - stageY) / scale,
                        width: box.width / scale,
                        height: box.height / scale,
                    };
                    const intersects =
                        worldBox.x < selWorld.x + selWorld.width &&
                        worldBox.x + worldBox.width > selWorld.x &&
                        worldBox.y < selWorld.y + selWorld.height &&
                        worldBox.y + worldBox.height > selWorld.y;
                    if (intersects) {
                        selectedIds.push(node.id());
                    }
                });
                if (selectedIds.length === 1) {
                    onSelectItem(selectedIds[0]);
                } else {
                    onSelectItem(null);
                }
            }
            selectionStartRef.current = null;
            setSelectionRect(null);
            return;
        }

        if (isPainting.current) {
            isPainting.current = false;
            if (terrainLayerRef.current) {
                terrainLayerRef.current.setInteractive(false);
                onUpdateTerrain(terrainLayerRef.current.getLayerData());
            }
            lastPaintPos.current = null;
        }
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointerPosition = getWorldPointerPosition(stage);
        if (!pointerPosition) return;

        // If clicking on empty space and tool is select, deselect
        if (selectedTool === 'select' && e.target === stage) {
            onSelectItem(null);
            return;
        }

        // Brush Tool Logic is handled in mouse move/down/up now

        if (selectedTool === 'text') {
            const textContent = textOptions.text.trim();
            if (!textContent) return;

            onAddItem({
                id: `text-${Date.now()}`,
                type: 'text',
                text: textContent,
                fontFamily: textOptions.fontFamily,
                fontSize: textOptions.fontSize,
                fill: textOptions.fill,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                x: pointerPosition.x,
                y: pointerPosition.y,
                opacity: textOptions.opacity,
                strokeEnabled: textOptions.strokeEnabled,
                stroke: textOptions.stroke,
                strokeWidth: textOptions.strokeWidth,
                shadowEnabled: textOptions.shadowEnabled,
                shadowColor: textOptions.shadowColor,
                shadowBlur: textOptions.shadowBlur,
                shadowOffsetX: textOptions.shadowOffsetX,
                shadowOffsetY: textOptions.shadowOffsetY,
                shadowOpacity: textOptions.shadowOpacity,
                align: textOptions.align,
                letterSpacing: textOptions.letterSpacing,
                lineHeight: textOptions.lineHeight,
            });
            return;
        }

        // Item Tool
        if (selectedTool === 'item' && selectedAsset && itemPlacementMode === 'single') {
            // Determine which asset to place
            let assetToPlace = selectedAsset;
            if (isRandomPlacement && selectedItemGroup && selectedItemGroup.length > 0) {
                const randomIndex = Math.floor(Math.random() * selectedItemGroup.length);
                assetToPlace = selectedItemGroup[randomIndex];
            }

            onAddItem({
                id: `item-${Date.now()}`,
                type: 'item',
                src: assetToPlace,
                x: pointerPosition.x - (brushSize / 2),
                y: pointerPosition.y - (brushSize / 2),
                width: brushSize,
                height: brushSize,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: itemOpacity,
            });
            if (isRandomPlacement) {
                onSelectAsset?.(assetToPlace);
            }
            // Switch to select tool after placing item? Or keep placing?
            // Let's keep placing for now.
        }
    };

    return (
        <div className="bg-gray-800 overflow-hidden">
            <Stage
                width={width}
                height={height}
                onMouseDown={(e) => {
                    handleStageMouseDown(e);
                }}
                onClick={handleStageClick}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                onWheel={handleWheel}
                draggable={selectedTool === 'hand'}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onDragEnd={(e) => {
                    // Only update stage position if the stage itself was dragged
                    if (e.target === e.currentTarget) {
                        setStagePos({
                            x: e.target.x(),
                            y: e.target.y(),
                        });
                    }
                }}
                ref={stageRef}
                className={
                    selectedTool === 'hand' ? 'cursor-grab active:cursor-grabbing' :
                        selectedTool === 'brush' || selectedTool === 'mask' ? 'cursor-none' :
                            'cursor-crosshair'
                }
            >
                <Layer>
                    <TerrainLayer
                        ref={terrainLayerRef}
                        width={width}
                        height={height}
                        initialBackgroundData={backgroundData}
                        initialForegroundData={foregroundData}
                        maskEffectsEnabled={maskEffectsEnabled}
                        maskEffectsSettings={maskEffectsSettings}
                    />
                </Layer>
                <Layer ref={itemsLayerRef}>
                    {/* Items Layer */}
                    {items.map((item) => (
                        item.type === 'item' ? (
                            <URLImage
                                key={item.id}
                                {...item}
                                draggable={selectedTool === 'select'}
                            onClick={(e: any) => {
                                if (selectedTool === 'select') {
                                    onSelectItem(item.id);
                                    e.cancelBubble = true;
                                }
                                }}
                            onDragEnd={(e: any) => {
                                onUpdateItem(item.id, {
                                    x: e.target.x(),
                                    y: e.target.y(),
                                });
                            }}
                                onTransformEnd={(e: any) => {
                                    const node = e.target;
                                    const scaleX = node.scaleX();
                                    const scaleY = node.scaleY();
                                    onUpdateItem(item.id, {
                                        x: node.x(),
                                        y: node.y(),
                                        rotation: node.rotation(),
                                        scaleX: scaleX,
                                        scaleY: scaleY,
                                    });
                                }}
                            />
                        ) : (
                            <KonvaText
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                x={item.x}
                                y={item.y}
                                fontFamily={item.fontFamily}
                                fontSize={item.fontSize}
                                fill={item.fill}
                                opacity={item.opacity}
                                align={item.align}
                                letterSpacing={item.letterSpacing}
                                lineHeight={item.lineHeight}
                                stroke={item.strokeEnabled ? item.stroke : undefined}
                                strokeWidth={item.strokeEnabled ? item.strokeWidth : 0}
                                shadowEnabled={item.shadowEnabled}
                                shadowColor={item.shadowColor}
                                shadowBlur={item.shadowBlur}
                                shadowOffsetX={item.shadowOffsetX}
                                shadowOffsetY={item.shadowOffsetY}
                                shadowOpacity={item.shadowOpacity}
                                scaleX={item.scaleX}
                                scaleY={item.scaleY}
                                rotation={item.rotation}
                                draggable={selectedTool === 'select' || selectedTool === 'text'}
                                onClick={(e: any) => {
                                    if (selectedTool === 'select' || selectedTool === 'text') {
                                        onSelectItem(item.id);
                                        e.cancelBubble = true;
                                    }
                                }}
                                onDragEnd={(e: any) => {
                                    onUpdateItem(item.id, {
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    });
                                }}
                                onTransformEnd={(e: any) => {
                                    const node = e.target as Konva.Text;
                                    onUpdateItem(item.id, {
                                        x: node.x(),
                                        y: node.y(),
                                        rotation: node.rotation(),
                                        scaleX: node.scaleX(),
                                        scaleY: node.scaleY(),
                                        fontSize: node.fontSize(),
                                        letterSpacing: node.letterSpacing(),
                                        lineHeight: node.lineHeight(),
                                    });
                                }}
                            />
                        )
                    ))}
                    {selectedItemId && (
                        <Transformer
                            ref={trRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                // limit resize
                                if (newBox.width < 5 || newBox.height < 5) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        // Attach to selected node
                        // node={items.find(i => i.id === selectedItemId) ? stageRef.current?.findOne(`#${selectedItemId}`) : undefined}
                        />
                    )}
                </Layer>
                <Layer ref={cursorLayerRef}>
                    {/* Cursor Layer */}
                    {(selectedTool === 'brush' || selectedTool === 'mask') && cursorPos && (
                        <BrushCursor
                            x={cursorPos.x}
                            y={cursorPos.y}
                            radius={brushSize / 2}
                            src={selectedTool === 'mask' && maskAction === 'subtract' ? subtractTexture : selectedAsset}
                        />
                    )}
                    {selectedTool === 'item' && cursorPos && selectedAsset && (
                        <ItemCursor
                            x={cursorPos.x}
                            y={cursorPos.y}
                            src={selectedAsset}
                            size={brushSize}
                            opacity={itemOpacity}
                        />
                    )}
                    {selectedTool === 'select' && selectionRect && (
                        <Rect
                            x={selectionRect.x}
                            y={selectionRect.y}
                            width={selectionRect.width}
                            height={selectionRect.height}
                            stroke="rgba(255, 215, 0, 0.7)"
                            strokeWidth={1}
                            dash={[4, 4]}
                            fill="rgba(255, 215, 0, 0.1)"
                            listening={false}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapCanvas;
