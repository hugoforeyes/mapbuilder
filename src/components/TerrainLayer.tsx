import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface TerrainLayerProps {
    width: number;
    height: number;
    initialData?: string | null;
}

export interface TerrainLayerRef {
    paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity?: number, softness?: number, color?: string) => void;
    getDataURL: () => string;
}

const TerrainLayer = forwardRef<TerrainLayerRef, TerrainLayerProps>(({ width, height, initialData }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const imageRef = useRef<any>(null);

    // Cache for loaded texture images to avoid reloading on every paint
    const textureCache = useRef<{ [key: string]: HTMLImageElement }>({});

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx && initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                if (imageRef.current) {
                    imageRef.current.getLayer().batchDraw();
                }
            };
            img.src = initialData;
        } else if (ctx) {
            // Initialize with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
    }, [width, height, initialData]);

    // Helper to create procedural patterns
    const createBrushPattern = (type: string, color: string, ctx: CanvasRenderingContext2D) => {
        const patternCanvas = document.createElement('canvas');
        const size = 24;
        patternCanvas.width = size;
        patternCanvas.height = size;
        const pctx = patternCanvas.getContext('2d');
        if (!pctx) return null;

        pctx.clearRect(0, 0, size, size);

        switch (type) {
            case 'solid':
                pctx.fillStyle = color;
                pctx.fillRect(0, 0, size, size);
                break;
            case 'dots':
                pctx.fillStyle = color;
                for (let x = 6; x < size; x += 12) {
                    for (let y = 6; y < size; y += 12) {
                        pctx.beginPath();
                        pctx.arc(x, y, 3, 0, Math.PI * 2);
                        pctx.fill();
                    }
                }
                break;
            case 'stripes':
                pctx.strokeStyle = color;
                pctx.lineWidth = 3;
                for (let i = -size; i < size * 2; i += 8) {
                    pctx.beginPath();
                    pctx.moveTo(i, 0);
                    pctx.lineTo(i + size, size);
                    pctx.stroke();
                }
                break;
            case 'noise':
                pctx.fillStyle = color;
                for (let i = 0; i < 150; i++) {
                    const x = Math.random() * size;
                    const y = Math.random() * size;
                    const alpha = 0.3 + Math.random() * 0.7;
                    pctx.globalAlpha = alpha;
                    pctx.fillRect(x, y, 1, 1);
                }
                pctx.globalAlpha = 1;
                break;
            default:
                pctx.fillStyle = color;
                pctx.fillRect(0, 0, size, size);
                break;
        }
        return ctx.createPattern(patternCanvas, 'repeat');
    };

    useImperativeHandle(ref, () => ({
        paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity = 1, softness = 0.5, color = '#000000') => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const paintWithPattern = (pattern: CanvasPattern | null) => {
                if (!pattern) return;

                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
                ctx.closePath();

                const tipCanvas = document.createElement('canvas');
                tipCanvas.width = brushSize * 2;
                tipCanvas.height = brushSize * 2;
                const tipCtx = tipCanvas.getContext('2d');
                if (tipCtx) {
                    // Draw pattern on tip canvas
                    const matrix = new DOMMatrix();
                    pattern.setTransform(matrix);

                    // Translate pattern to match world coordinates
                    tipCtx.translate(-(x - brushSize), -(y - brushSize));
                    tipCtx.fillStyle = pattern;
                    tipCtx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);

                    // Reset transform
                    tipCtx.setTransform(1, 0, 0, 1, 0, 0);

                    // Apply radial gradient for softness
                    tipCtx.globalCompositeOperation = 'destination-in';
                    const gradient = tipCtx.createRadialGradient(
                        brushSize, brushSize, (brushSize / 2) * (1 - softness),
                        brushSize, brushSize, brushSize / 2
                    );
                    gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    tipCtx.fillStyle = gradient;
                    tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);

                    // Draw tip onto main canvas
                    ctx.drawImage(tipCanvas, x - brushSize, y - brushSize);
                }

                ctx.restore();

                if (imageRef.current) {
                    const layer = imageRef.current.getLayer();
                    if (layer) layer.batchDraw();
                }
            };

            // Check if textureSrc is a procedural type
            if (['solid', 'dots', 'stripes', 'noise'].includes(textureSrc)) {
                const pattern = createBrushPattern(textureSrc, color, ctx);
                paintWithPattern(pattern);
            } else {
                // Image texture logic
                if (textureCache.current[textureSrc]) {
                    const img = textureCache.current[textureSrc];
                    const pattern = ctx.createPattern(img, 'repeat');
                    paintWithPattern(pattern);
                } else {
                    const img = new Image();
                    img.src = textureSrc;
                    img.onload = () => {
                        textureCache.current[textureSrc] = img;
                        const pattern = ctx.createPattern(img, 'repeat');
                        paintWithPattern(pattern);
                    };
                }
            }
        },
        getDataURL: () => {
            return canvasRef.current.toDataURL();
        }
    }));

    return (
        <KonvaImage
            ref={imageRef}
            image={canvasRef.current}
            width={width}
            height={height}
            listening={false}
        />
    );
});

export default TerrainLayer;
