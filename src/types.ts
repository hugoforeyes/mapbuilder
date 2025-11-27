export type ToolType = 'brush' | 'item' | 'select' | 'hand' | 'mask' | 'text';

interface MapBase {
    id: string;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity?: number;
}

export interface MapItem extends MapBase {
    type: 'item';
    src: string;
    width: number;
    height: number;
}

export interface MapText extends MapBase {
    type: 'text';
    text: string;
    fontFamily: string;
    fontSize: number;
    fill: string;
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
}

export type MapElement = MapItem | MapText;

export interface BackgroundTile {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Asset {
    name: string;
    src: string;
    category: 'background' | 'items';
}

export interface MaskSettings {
    stroke: {
        enabled: boolean;
        texture: string | null;
        width: number;
        color: string;
    };
    outline: {
        enabled: boolean;
        color: string;
        width: number;
    };
    shadows: {
        outer: {
            enabled: boolean;
            color: string;
            blur: number;
        };
        inner: {
            enabled: boolean;
            color: string;
            blur: number;
        };
    };
    ripples: {
        enabled: boolean;
        texture: string | null;
        width: number;
        count: number;
        gap: number;
    };
}
// Force rebuild
