export interface MapItem {
    id: string;
    type: 'item';
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity?: number;
}

export interface BackgroundTile {
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ToolType = 'brush' | 'item' | 'select' | 'hand';

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
