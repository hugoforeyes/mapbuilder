import React, { useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Circle } from 'react-konva';
import useImage from 'use-image';
import type { MapItem, ToolType } from '../types';
import Konva from 'konva';
import type { TerrainLayerRef } from './TerrainLayer';
import TerrainLayer from './TerrainLayer';

interface MapCanvasProps {
    width: number;
    height: number;
    terrainData: string | null;
    items: MapItem[];
    selectedTool: ToolType;
    selectedAsset: string | null;
    onUpdateTerrain: (data: string) => void;
    brushSize: number;
    onAddItem: (item: MapItem) => void;
    onUpdateItem: (id: string, newAttrs: Partial<MapItem>) => void;
    onSelectItem: (id: string | null) => void;
    selectedItemId: string | null;
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

const MapCanvas: React.FC<MapCanvasProps> = ({
    width,
    height,
    terrainData,
    items,
    selectedTool,
    selectedAsset,
    onUpdateTerrain,
    brushSize,
    onAddItem,
    onUpdateItem,
    onSelectItem,
    selectedItemId,
}) => {
    const stageRef = useRef<Konva.Stage>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const terrainLayerRef = useRef<TerrainLayerRef>(null);
    const isPainting = useRef(false);
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

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

    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        if (selectedTool === 'brush' && selectedAsset) {
            isPainting.current = true;
            const pos = stage.getRelativePointerPosition();
            if (pos && terrainLayerRef.current) {
                terrainLayerRef.current.paint(pos.x, pos.y, brushSize, selectedAsset);
            }
        }
    };

    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        // Update cursor position for brush tool
        if (selectedTool === 'brush') {
            const pos = stage.getRelativePointerPosition();
            if (pos) {
                setCursorPos(pos);
            }
        } else {
            if (cursorPos) setCursorPos(null);
        }

        if (!isPainting.current) return;

        if (selectedTool === 'brush' && selectedAsset) {
            const pos = stage.getRelativePointerPosition();
            if (pos && terrainLayerRef.current) {
                terrainLayerRef.current.paint(pos.x, pos.y, brushSize, selectedAsset);
            }
        }
    };

    const handleStageMouseUp = () => {
        if (isPainting.current) {
            isPainting.current = false;
            if (terrainLayerRef.current) {
                onUpdateTerrain(terrainLayerRef.current.getDataURL());
            }
        }
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointerPosition = stage.getPointerPosition();
        if (!pointerPosition) return;

        // If clicking on empty space and tool is select, deselect
        if (selectedTool === 'select' && e.target === stage) {
            onSelectItem(null);
            return;
        }

        // Brush Tool Logic is handled in mouse move/down/up now

        // Item Tool
        if (selectedTool === 'item' && selectedAsset) {
            onAddItem({
                id: `item-${Date.now()}`,
                type: 'item',
                src: selectedAsset,
                x: pointerPosition.x,
                y: pointerPosition.y,
                width: 100, // Default size, will be adjusted by image aspect ratio ideally
                height: 100,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            });
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
                    handleStageClick(e);
                    handleStageMouseDown(e);
                }}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                onWheel={handleWheel}
                draggable={selectedTool === 'hand'}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={stageScale}
                scaleY={stageScale}
                onDragEnd={(e) => {
                    setStagePos({
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                ref={stageRef}
                className={
                    selectedTool === 'hand' ? 'cursor-grab active:cursor-grabbing' :
                        selectedTool === 'brush' ? 'cursor-none' :
                            'cursor-crosshair'
                }
            >
                <Layer>
                    <TerrainLayer
                        ref={terrainLayerRef}
                        width={width}
                        height={height}
                        initialData={terrainData}
                    />
                </Layer>
                <Layer>
                    {/* Items Layer */}
                    {items.map((item) => (
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
                                // reset scale to 1 and adjust width/height or keep scale?
                                // Konva transformer changes scale.
                                onUpdateItem(item.id, {
                                    x: node.x(),
                                    y: node.y(),
                                    rotation: node.rotation(),
                                    scaleX: scaleX,
                                    scaleY: scaleY,
                                });
                            }}
                        />
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
                            node={items.find(i => i.id === selectedItemId) ? stageRef.current?.findOne(`#${selectedItemId}`) : undefined}
                        />
                    )}
                </Layer>
                <Layer>
                    {/* Cursor Layer */}
                    {selectedTool === 'brush' && cursorPos && (
                        <BrushCursor
                            x={cursorPos.x}
                            y={cursorPos.y}
                            radius={brushSize / 2}
                            src={selectedAsset}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

export default MapCanvas;
