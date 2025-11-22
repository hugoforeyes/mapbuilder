import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface TerrainLayerProps {
    width: number;
    height: number;
    initialData?: string | null;
}

export interface TerrainLayerRef {
    paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity?: number, softness?: number) => void;
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
            // Initialize with a transparent or base color if needed
            ctx.clearRect(0, 0, width, height);
        }
    }, [width, height, initialData]);

    useImperativeHandle(ref, () => ({
        paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity = 1, softness = 0.5) => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const paintWithTexture = (img: HTMLImageElement) => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
                ctx.closePath();

                // Improved Soft Brush:
                // 1. Create a temp canvas for the brush tip
                // 2. Draw the pattern on the temp canvas
                // 3. Apply a radial gradient alpha mask to the temp canvas
                // 4. Draw the temp canvas onto the main canvas

                const tipCanvas = document.createElement('canvas');
                tipCanvas.width = brushSize * 2; // Extra space for blur
                tipCanvas.height = brushSize * 2;
                const tipCtx = tipCanvas.getContext('2d');
                if (tipCtx) {
                    const pattern = tipCtx.createPattern(img, 'repeat');
                    if (pattern) {
                        // Draw pattern on tip canvas
                        // Offset pattern to match world coordinates
                        const matrix = new DOMMatrix();
                        matrix.translateSelf(0, 0); // Reset
                        pattern.setTransform(matrix);

                        // We need to translate the pattern so it stays fixed relative to the world (canvas)
                        // The tip canvas is at (x - brushSize, y - brushSize) relative to main canvas
                        // So we need to offset the pattern by -(x - brushSize), -(y - brushSize)

                        tipCtx.translate(-(x - brushSize), -(y - brushSize));
                        tipCtx.fillStyle = pattern;
                        tipCtx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);

                        // Reset transform for the mask
                        tipCtx.setTransform(1, 0, 0, 1, 0, 0);

                        // Apply radial gradient for softness
                        tipCtx.globalCompositeOperation = 'destination-in';
                        const gradient = tipCtx.createRadialGradient(
                            brushSize, brushSize, brushSize * (1 - softness),
                            brushSize, brushSize, brushSize / 2
                        );
                        gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                        tipCtx.fillStyle = gradient;
                        tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);

                        // Draw tip onto main canvas
                        ctx.drawImage(tipCanvas, x - brushSize, y - brushSize);
                    }
                }

                ctx.restore();

                // Force Konva update
                if (imageRef.current) {
                    const layer = imageRef.current.getLayer();
                    if (layer) layer.batchDraw();
                }
            };

            if (textureCache.current[textureSrc]) {
                paintWithTexture(textureCache.current[textureSrc]);
            } else {
                const img = new Image();
                img.src = textureSrc;
                img.onload = () => {
                    textureCache.current[textureSrc] = img;
                    paintWithTexture(img);
                };
                img.onerror = (err) => {
                    console.error('Failed to load texture:', textureSrc, err);
                };
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
