import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChromePicker, type ColorResult } from 'react-color';

interface ColorPickerProps {
    label?: string;
    color: string;
    onChangeColor: (color: string) => void;
    alpha?: number;
    onChangeAlpha?: (alpha: number) => void;
    presets?: string[];
    disableAlpha?: boolean;
}

const defaultPresets = ['#ffffff', '#000000', '#f5c442', '#d97757', '#8ec5ff', '#b07cf7', '#5ad3a1', '#7b7b7b'];

const ColorPicker: React.FC<ColorPickerProps> = ({
    label,
    color,
    onChangeColor,
    alpha = 1,
    onChangeAlpha,
    presets = defaultPresets,
    disableAlpha = false,
}) => {
    const [open, setOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const defaultHeight = 320;

    const hexToRgb = (hex: string) => {
        const normalized = hex.replace('#', '');
        const full = normalized.length === 3
            ? normalized.split('').map((c) => c + c).join('')
            : normalized;
        const int = parseInt(full || 'ffffff', 16);
        return {
            r: (int >> 16) & 255,
            g: (int >> 8) & 255,
            b: int & 255,
        };
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const updatePosition = (panelHeight?: number) => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        const panelWidth = 260;
        const margin = 8;
        const height = panelHeight ?? pickerRef.current?.offsetHeight ?? defaultHeight;
        const desiredLeft = rect.left + window.scrollX;
        const maxLeft = window.scrollX + window.innerWidth - panelWidth - margin;
        const left = Math.max(window.scrollX + margin, Math.min(desiredLeft, maxLeft));
        const spaceBelow = window.innerHeight - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        let top: number;
        if (spaceBelow >= height || spaceBelow >= spaceAbove) {
            top = rect.bottom + window.scrollY + 6;
            top = Math.min(top, window.scrollY + window.innerHeight - height - margin);
        } else {
            top = rect.top + window.scrollY - height - 6;
            top = Math.max(window.scrollY + margin, top);
        }
        setPopupPos({ top, left });
    };

    useLayoutEffect(() => {
        if (open) {
            updatePosition();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onResize = () => updatePosition();
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [open]);

    useLayoutEffect(() => {
        if (!open) return;
        const id = requestAnimationFrame(() => {
            updatePosition(pickerRef.current?.offsetHeight ?? defaultHeight);
        });
        return () => cancelAnimationFrame(id);
    }, [open]);

    const handleColorChange = (result: ColorResult) => {
        onChangeColor(result.hex);
        if (!disableAlpha && onChangeAlpha) {
            onChangeAlpha(result.rgb.a ?? 1);
        }
    };

    return (
        <div className="space-y-2">
            {label && <div className="text-xs text-zinc-400 font-fantasy">{label}</div>}
            <div className="relative" ref={pickerRef}>
                <button
                    ref={triggerRef}
                    type="button"
                    className="w-full flex items-center space-x-2 bg-zinc-950 border border-zinc-800 rounded px-2 py-2 hover:border-gold-500 transition-colors"
                    onClick={() => setOpen(!open)}
                >
                    <div className="w-8 h-8 rounded border border-zinc-700 overflow-hidden relative">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,_#2f2f2f_25%,_transparent_25%),linear-gradient(-45deg,_#2f2f2f_25%,_transparent_25%),linear-gradient(45deg,_transparent_75%,_#2f2f2f_75%),linear-gradient(-45deg,_transparent_75%,_#2f2f2f_75%)] bg-[length:8px_8px] bg-zinc-900" />
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: color, opacity: disableAlpha ? 1 : alpha }}
                        />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-xs text-zinc-400 font-fantasy">Selected</div>
                        <div className="text-sm text-zinc-200 font-mono">{color.toUpperCase()}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {open && createPortal(
                    <div
                        ref={pickerRef}
                        className="fixed z-[9999] bg-zinc-900 border border-zinc-800 rounded shadow-2xl p-3 space-y-2 overflow-auto"
                        style={{ top: popupPos.top, left: popupPos.left, maxHeight: 'calc(100vh - 16px)' }}
                    >
                        <ChromePicker
                            color={
                                disableAlpha
                                    ? color
                                    : { ...hexToRgb(color), a: alpha }
                            }
                            onChange={handleColorChange}
                            disableAlpha={disableAlpha}
                        />
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        onChangeColor(preset);
                                        if (!disableAlpha && onChangeAlpha) onChangeAlpha(alpha);
                                    }}
                                    className="w-6 h-6 rounded border border-zinc-700"
                                    style={{ backgroundColor: preset }}
                                />
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default ColorPicker;
