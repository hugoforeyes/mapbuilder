import { useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface TerrainLayerProps {
    width: number;
    height: number;
    initialData?: string | null;
}

export interface TerrainLayerRef {
    paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity?: number, softness?: number, color?: string, shape?: 'circle' | 'rough', roughness?: number, smooth?: boolean) => void;
    getDataURL: () => string;
}

const TerrainLayer = forwardRef<TerrainLayerRef, TerrainLayerProps>(({ width, height, initialData }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }
    const imageRef = useRef<any>(null);

    // Cache for loaded texture images to avoid reloading on every paint
    const textureCache = useRef<{ [key: string]: HTMLImageElement }>({});

    useEffect(() => {
        const canvas = canvasRef.current!;
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
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
        paint: (x: number, y: number, brushSize: number, textureSrc: string, opacity = 1, softness = 0.5, color = '#000000', shape: 'circle' | 'rough' = 'circle', roughness = 0.5, smooth = false) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const paintWithPattern = (pattern: CanvasPattern | null) => {
                if (!pattern) return;

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

                    if (shape === 'rough') {
                        // Draw rough shape on tip canvas
                        tipCtx.beginPath();
                        // We need deterministic roughness for the tip to match the main path if we want exact match, 
                        // but since we are just masking, maybe random is fine or we seed it?
                        // For now let's just use a simple rough circle logic again or just fill rect if we rely on destination-in later?
                        // Actually, we need to fill the shape with the pattern.

                        // Let's just fill a rect for now, the destination-in step will cut it to shape.
                        tipCtx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
                    } else {
                        tipCtx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
                    }

                    // Reset transform
                    tipCtx.setTransform(1, 0, 0, 1, 0, 0);

                    // Apply radial gradient for softness
                    tipCtx.globalCompositeOperation = 'destination-in';

                    if (softness === 0) {
                        // Hard brush
                        tipCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                        tipCtx.beginPath();

                        if (shape === 'rough') {
                            const points = 20;
                            const radius = brushSize / 2;
                            const pathPoints: { x: number, y: number }[] = [];

                            for (let i = 0; i <= points; i++) {
                                const angle = (i / points) * Math.PI * 2;
                                const variation = roughness * 0.05;
                                const r = radius * (1 - variation / 2 + Math.random() * variation);
                                const px = brushSize + Math.cos(angle) * r;
                                const py = brushSize + Math.sin(angle) * r;
                                pathPoints.push({ x: px, y: py });
                            }

                            if (smooth) {
                                tipCtx.moveTo(pathPoints[0].x, pathPoints[0].y);
                                for (let i = 1; i < pathPoints.length - 2; i++) {
                                    const xc = (pathPoints[i].x + pathPoints[i + 1].x) / 2;
                                    const yc = (pathPoints[i].y + pathPoints[i + 1].y) / 2;
                                    tipCtx.quadraticCurveTo(pathPoints[i].x, pathPoints[i].y, xc, yc);
                                }
                                tipCtx.quadraticCurveTo(
                                    pathPoints[pathPoints.length - 2].x,
                                    pathPoints[pathPoints.length - 2].y,
                                    pathPoints[pathPoints.length - 1].x,
                                    pathPoints[pathPoints.length - 1].y
                                );
                            } else {
                                tipCtx.moveTo(pathPoints[0].x, pathPoints[0].y);
                                for (let i = 1; i < pathPoints.length; i++) {
                                    tipCtx.lineTo(pathPoints[i].x, pathPoints[i].y);
                                }
                            }
                        } else {
                            tipCtx.arc(brushSize, brushSize, brushSize / 2, 0, Math.PI * 2);
                        }

                        tipCtx.fill();
                    } else {
                        // For soft rough brush, we need a gradient that follows the rough shape? 
                        // Standard radial gradient is circular. 
                        // For now, let's just use the circular gradient for soft brush, maybe 'rough' only applies to hard edges or we mask the gradient?

                        // Let's try to mask the gradient with a rough shape if shape is rough

                        const gradient = tipCtx.createRadialGradient(
                            brushSize, brushSize, (brushSize / 2) * (1 - softness),
                            brushSize, brushSize, brushSize / 2
                        );
                        gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                        tipCtx.fillStyle = gradient;

                        if (shape === 'rough') {
                            // Mask the gradient with rough shape? 
                            // Actually, if we want a "rough" soft brush, it's complex. 
                            // Let's just apply the rough mask to the gradient rect.

                            // Clear rect first? No we want to draw the gradient THEN cut it? 
                            // No, we are drawing the "alpha map" here to destination-in the pattern.

                            // Let's draw the gradient, then use destination-in with a rough shape?
                            // Or just draw the gradient. 
                            // If user wants rough shape, usually they want the edge to be rough.
                            // If softness > 0, the edge is faded.
                            // Let's stick to circular gradient for soft brush for now, as rough soft brush is hard to notice roughness.
                            // OR we can multiply the gradient with noise?

                            // For simplicity, let's just use the standard gradient for now even if rough, 
                            // or maybe modulate the outer radius?

                            tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);
                        } else {
                            tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);
                        }
                    }

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
            return canvasRef.current?.toDataURL() || '';
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

export default memo(TerrainLayer);
