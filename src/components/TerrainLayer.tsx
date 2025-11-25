import { useEffect, useRef, useImperativeHandle, forwardRef, memo } from 'react';
import { Image as KonvaImage } from 'react-konva';

import type { MaskSettings } from '../types';

interface TerrainLayerProps {
    width: number;
    height: number;
    initialData?: string | null;
    maskEffectsEnabled?: boolean;
    maskEffectsSettings?: MaskSettings;
}

export interface TerrainLayerRef {
    paint: (x: number, y: number, brushSize: number, textureSrc: string, layer: 'background' | 'foreground', opacity?: number, softness?: number, color?: string, shape?: 'circle' | 'rough', roughness?: number, smooth?: boolean, isMaskStroke?: boolean) => void;
    getDataURL: () => string;
    setInteractive: (interactive: boolean) => void;
}

const TerrainLayer = forwardRef<TerrainLayerRef, TerrainLayerProps>(({ width, height, initialData, maskEffectsEnabled, maskEffectsSettings }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const foregroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<any>(null);
    const isInteractiveRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    // Cache for loaded texture images to avoid reloading on every paint
    const textureCache = useRef<{ [key: string]: HTMLImageElement }>({});

    // Initialize canvases
    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }
    if (!foregroundCanvasRef.current) {
        foregroundCanvasRef.current = document.createElement('canvas');
    }
    if (!backgroundCanvasRef.current) {
        backgroundCanvasRef.current = document.createElement('canvas');
    }
    if (!maskCanvasRef.current) {
        maskCanvasRef.current = document.createElement('canvas');
    }

    const compose = () => {
        const canvas = canvasRef.current;
        const foregroundCanvas = foregroundCanvasRef.current;
        const backgroundCanvas = backgroundCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (!canvas || !foregroundCanvas || !backgroundCanvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Background
        ctx.drawImage(backgroundCanvas, 0, 0);

        // 2. Draw Mask Effects (if enabled)
        if (maskEffectsEnabled && maskEffectsSettings && maskCanvas) {
            const maskEffectCanvas = document.createElement('canvas');
            maskEffectCanvas.width = width;
            maskEffectCanvas.height = height;
            const maskCtx = maskEffectCanvas.getContext('2d');

            if (maskCtx) {
                maskCtx.clearRect(0, 0, width, height);
                maskCtx.drawImage(maskCanvas, 0, 0);

                maskCtx.globalCompositeOperation = 'source-in';
                maskCtx.fillStyle = '#000000';
                maskCtx.fillRect(0, 0, width, height);
                maskCtx.globalCompositeOperation = 'source-over';

                // Helper to draw shadow/glow using the MASK
                const drawEffect = (color: string, blur: number, opacity: number = 1) => {
                    ctx.save();
                    ctx.shadowColor = color;
                    ctx.shadowBlur = blur;
                    ctx.shadowOffsetX = 10000; // Move shadow on screen
                    ctx.globalAlpha = opacity;
                    // Draw MASK off-screen so only the shadow is visible in the viewport
                    ctx.drawImage(maskEffectCanvas, -10000, 0);
                    ctx.restore();
                };

                // OPTIMIZATION: If interactive (painting), skip expensive effects
                if (isInteractiveRef.current) {
                    // Simplified rendering during interaction
                    // 1. Skip Ripples entirely

                    // 2. Simplified Outer Shadow (single pass)
                    if (maskEffectsSettings.shadows.outer.enabled) {
                        const { color, blur } = maskEffectsSettings.shadows.outer;
                        // Use a smaller blur or single pass for performance
                        drawEffect(color, blur, 0.8);
                    }

                    // 3. Simplified Outline (single pass)
                    if (maskEffectsSettings.outline.enabled) {
                        const { color, width: outlineWidth } = maskEffectsSettings.outline;
                        drawEffect(color, outlineWidth, 1);
                    }

                    // 4. Stroke (keep as is, usually cheap enough, or simplify)
                    if (maskEffectsSettings.stroke.enabled) {
                        const { color, width: strokeWidth } = maskEffectsSettings.stroke;
                        drawEffect(color, strokeWidth, 1);
                    }

                } else {
                    // Full Quality Rendering

                    // Ripples
                    if (maskEffectsSettings.ripples.enabled) {
                        const { count, width: rippleWidth, gap } = maskEffectsSettings.ripples;
                        const rippleColor = 'rgba(100, 200, 255, 0.5)';

                        for (let i = count; i > 0; i--) {
                            const blur = (i * gap) + rippleWidth;
                            drawEffect(rippleColor, blur, 1 - (i / count) * 0.5);
                        }
                    }

                    // Outer Shadows
                    if (maskEffectsSettings.shadows.outer.enabled) {
                        const { color, blur } = maskEffectsSettings.shadows.outer;
                        drawEffect(color, blur);
                    }

                    // Outline
                    if (maskEffectsSettings.outline.enabled) {
                        const { color, width: outlineWidth } = maskEffectsSettings.outline;
                        drawEffect(color, outlineWidth, 1);
                        drawEffect(color, outlineWidth / 2, 1);
                    }

                    // Stroke
                    if (maskEffectsSettings.stroke.enabled) {
                        const { color, width: strokeWidth } = maskEffectsSettings.stroke;
                        drawEffect(color, strokeWidth, 1);
                        drawEffect(color, 2, 1); // Hard edge
                    }
                }
            }
        }

        // 3. Draw Foreground on top
        ctx.drawImage(foregroundCanvas, 0, 0);

        // Update Konva layer
        if (imageRef.current) {
            const layer = imageRef.current.getLayer();
            if (layer) layer.batchDraw();
        }
    };

    const scheduleCompose = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(compose);
    };

    useEffect(() => {
        const canvas = canvasRef.current!;
        const foregroundCanvas = foregroundCanvasRef.current!;
        const backgroundCanvas = backgroundCanvasRef.current!;
        const maskCanvas = maskCanvasRef.current!;

        if (canvas.width !== width) {
            canvas.width = width;
            foregroundCanvas.width = width;
            backgroundCanvas.width = width;
            maskCanvas.width = width;
        }
        if (canvas.height !== height) {
            canvas.height = height;
            foregroundCanvas.height = height;
            backgroundCanvas.height = height;
            maskCanvas.height = height;
        }

        const bgCtx = backgroundCanvas.getContext('2d');

        if (bgCtx) {
            if (initialData) {
                // If we have initial data, we assume it's the full map. 
                // Ideally we would split it, but we can't. 
                // So we treat it as "Water" (Background) for now so new painting goes on top.
                // OR we treat it as "Land" if it was painted? 
                // For now, let's load it into the Background canvas so it acts as the base.
                const img = new Image();
                img.onload = () => {
                    bgCtx.drawImage(img, 0, 0);
                    scheduleCompose();
                };
                img.src = initialData;
            } else {
                // Initialize with water texture by default
                const img = new Image();
                img.src = '/assets/background/FantasyWorld/water/asset_14.jpg';
                img.onload = () => {
                    const pattern = bgCtx.createPattern(img, 'repeat');
                    if (pattern) {
                        bgCtx.fillStyle = pattern;
                        bgCtx.fillRect(0, 0, width, height);
                        scheduleCompose();
                    }
                };
            }
        }
    }, [width, height, initialData]);

    // Re-compose when mask effects settings change
    useEffect(() => {
        scheduleCompose();
    }, [maskEffectsEnabled, maskEffectsSettings]);

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
        paint: (x: number, y: number, brushSize: number, textureSrc: string, layer: 'background' | 'foreground', opacity = 1, softness = 0.5, color = '#000000', shape: 'circle' | 'rough' = 'circle', roughness = 0.5, smooth = false, isMaskStroke = false) => {
            const targetCanvas = layer === 'foreground' ? foregroundCanvasRef.current : backgroundCanvasRef.current;
            const maskCanvas = maskCanvasRef.current;
            if (!targetCanvas) return;
            const ctx = targetCanvas.getContext('2d');
            if (!ctx) return;

            const paintWithPattern = (pattern: CanvasPattern | null) => {
                if (!pattern) return;

                ctx.save();

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
                        const gradient = tipCtx.createRadialGradient(
                            brushSize, brushSize, (brushSize / 2) * (1 - softness),
                            brushSize, brushSize, brushSize / 2
                        );
                        gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                        tipCtx.fillStyle = gradient;
                        tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);
                    }

                    let tipToDraw: HTMLCanvasElement | null = tipCanvas;

                    // Restrict foreground painting to masked area (unless we are painting the mask itself)
                    if (layer === 'foreground' && !isMaskStroke) {
                        if (!maskCanvas) {
                            ctx.restore();
                            return;
                        }

                        const maskedTipCanvas = document.createElement('canvas');
                        maskedTipCanvas.width = tipCanvas.width;
                        maskedTipCanvas.height = tipCanvas.height;
                        const maskedTipCtx = maskedTipCanvas.getContext('2d');

                        if (!maskedTipCtx) {
                            ctx.restore();
                            return;
                        }

                        maskedTipCtx.drawImage(
                            maskCanvas,
                            x - brushSize,
                            y - brushSize,
                            brushSize * 2,
                            brushSize * 2,
                            0,
                            0,
                            brushSize * 2,
                            brushSize * 2
                        );
                        maskedTipCtx.globalCompositeOperation = 'source-in';
                        maskedTipCtx.drawImage(tipCanvas, 0, 0);
                        tipToDraw = maskedTipCanvas;
                    }

                    // Record mask coverage for mask strokes
                    if (isMaskStroke && maskCanvas) {
                        const maskCtx = maskCanvas.getContext('2d');
                        if (maskCtx) {
                            maskCtx.drawImage(tipCanvas, x - brushSize, y - brushSize);
                        }
                    }

                    // Draw tip onto target canvas
                    if (tipToDraw) {
                        ctx.drawImage(tipToDraw, x - brushSize, y - brushSize);
                    }
                }

                ctx.restore();

                // Re-compose the layers
                scheduleCompose();
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
            // Return a clean composite of background and foreground, ignoring mask effects
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const ctx = tempCanvas.getContext('2d');
            if (ctx) {
                if (backgroundCanvasRef.current) {
                    ctx.drawImage(backgroundCanvasRef.current, 0, 0);
                }
                if (foregroundCanvasRef.current) {
                    ctx.drawImage(foregroundCanvasRef.current, 0, 0);
                }
            }
            return tempCanvas.toDataURL();
        },
        setInteractive: (interactive: boolean) => {
            isInteractiveRef.current = interactive;
            // If we just finished interacting, trigger a full compose to restore high-quality effects
            if (!interactive) {
                scheduleCompose();
            }
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
