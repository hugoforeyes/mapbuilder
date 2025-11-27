# Components

UI building blocks for the editor.

Key files:
- `MapCanvas.tsx`: Konva stage with terrain, items/text rendering, selection, and tool cursors.
- `TerrainLayer.tsx`: canvas-based terrain/mask painter with effects and serialization helpers.
- `ToolOptionsPanel.tsx`: orchestrates per-tool option UIs (delegates to subcomponents).
- `Toolbar.tsx`: tool switcher (select, brush, mask, item, text, hand).
- `RightPanel.tsx`: asset catalog and layer list.
- `TopBar.tsx`: top controls (save/load/undo/redo).
- `MaskEffectsPanel.tsx`: detailed mask effect controls.
- `tool-options/`: subcomponents for tool-specific settings (see its README).
