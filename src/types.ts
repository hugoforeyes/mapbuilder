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
