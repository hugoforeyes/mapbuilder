import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface TopPaintLayerProps {
    width: number;
    height: number;
    initialData?: string | null;
}

export interface TopPaintLayerRef {
    paint: (
        x: number,
        y: number,
        brushSize: number,
        textureSrc: string,
        opacity?: number,
        softness?: number,
        color?: string,
        shape?: 'circle' | 'rough',
        roughness?: number,
        smooth?: boolean
    ) => void;
    getDataURL: () => string | null;
    setInteractive: (interactive: boolean) => void;
    erase: (
        x: number,
        y: number,
        brushSize: number,
        softness?: number,
        shape?: 'circle' | 'rough',
        roughness?: number,
        smooth?: boolean
    ) => void;
}

const TopPaintLayer = forwardRef<TopPaintLayerRef, TopPaintLayerProps>(({ width, height, initialData }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<any>(null);
    const textureCache = useRef<Record<string, HTMLImageElement>>({});
    const animationFrameRef = useRef<number | null>(null);
    const isInteractiveRef = useRef(false);

    if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
    }

    const scheduleDraw = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            const layer = imageRef.current?.getLayer();
            if (layer) layer.batchDraw();
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current!;
        if (canvas.width !== width) {
            canvas.width = width;
        }
        if (canvas.height !== height) {
            canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (initialData) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0);
                scheduleDraw();
            };
            img.src = initialData;
        } else {
            ctx.clearRect(0, 0, width, height);
            scheduleDraw();
        }
    }, [width, height, initialData]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

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
        paint: (x, y, brushSize, textureSrc, opacity = 1, softness = 0.5, color = '#000000', shape: 'circle' | 'rough' = 'circle', roughness = 0.5, smooth = false) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const paintWithPattern = (pattern: CanvasPattern | null) => {
                if (!pattern) return;

                ctx.save();

                const tipCanvas = document.createElement('canvas');
                tipCanvas.width = brushSize * 2;
                tipCanvas.height = brushSize * 2;
                const tipCtx = tipCanvas.getContext('2d');
                if (tipCtx) {
                    const matrix = new DOMMatrix();
                    pattern.setTransform(matrix);

                    tipCtx.translate(-(x - brushSize), -(y - brushSize));
                    tipCtx.fillStyle = pattern;
                    tipCtx.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
                    tipCtx.setTransform(1, 0, 0, 1, 0, 0);

                    tipCtx.globalCompositeOperation = 'destination-in';

                    if (softness === 0) {
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

                    ctx.drawImage(tipCanvas, x - brushSize, y - brushSize);
                }

                ctx.restore();
                scheduleDraw();
            };

            if (['solid', 'dots', 'stripes', 'noise'].includes(textureSrc)) {
                const pattern = createBrushPattern(textureSrc, color, ctx);
                paintWithPattern(pattern);
            } else {
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
        getDataURL: () => canvasRef.current?.toDataURL() ?? null,
        setInteractive: (interactive: boolean) => {
            isInteractiveRef.current = interactive;
        },
        erase: (x, y, brushSize, softness = 0.5, shape: 'circle' | 'rough' = 'circle', roughness = 0.5, smooth = false) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const tipCanvas = document.createElement('canvas');
            tipCanvas.width = brushSize * 2;
            tipCanvas.height = brushSize * 2;
            const tipCtx = tipCanvas.getContext('2d');
            if (tipCtx) {
                tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
                tipCtx.globalCompositeOperation = 'source-over';

                if (softness === 0) {
                    tipCtx.fillStyle = 'rgba(0,0,0,1)';
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
                        brushSize,
                        brushSize,
                        (brushSize / 2) * (1 - softness),
                        brushSize,
                        brushSize,
                        brushSize / 2
                    );
                    gradient.addColorStop(0, 'rgba(0,0,0,1)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    tipCtx.fillStyle = gradient;
                    tipCtx.fillRect(0, 0, brushSize * 2, brushSize * 2);
                }
            }

            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(tipCanvas, x - brushSize, y - brushSize);
            ctx.restore();

            scheduleDraw();
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

export default TopPaintLayer;
