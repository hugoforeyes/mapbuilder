# Tool Options

Per-tool option UIs used by `ToolOptionsPanel`:
- `BrushOptions.tsx`: layer toggles, brush mode/size/opacity/softness/roughness controls.
- `EraserOptions.tsx`: top-layer eraser size/softness/roughness controls (clears brush strokes on the top overlay).
- `MaskOptions.tsx`: mask enable, action (add/subtract), effect settings toggle, texture selection, brush controls.
- `ItemOptions.tsx`: object selection, placement mode, scale, opacity, random placement toggle.
- `TextOptions.tsx`: text content, font, fill/outline/shadow with alpha, spacing, alignment, size.

Shared helpers:
- `ColorPicker.tsx`: popup color/alpha picker (react-color).
- `AssetSelector.tsx`: asset preview/selection UI with optional random toggle and presets.
