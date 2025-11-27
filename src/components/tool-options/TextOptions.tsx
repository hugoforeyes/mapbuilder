import React from 'react';
import ColorPicker from './ColorPicker';

interface TextOptionsProps {
    textValue: string;
    setTextValue: (value: string) => void;
    textFontFamily: string;
    setTextFontFamily: (font: string) => void;
    textFontSize: number;
    setTextFontSize: (size: number) => void;
    textFill: string;
    setTextFill: (color: string) => void;
    textOpacity: number;
    setTextOpacity: (opacity: number) => void;
    textStrokeEnabled: boolean;
    setTextStrokeEnabled: (enabled: boolean) => void;
    textStrokeColor: string;
    setTextStrokeColor: (color: string) => void;
    textStrokeAlpha: number;
    setTextStrokeAlpha: (alpha: number) => void;
    textStrokeWidth: number;
    setTextStrokeWidth: (width: number) => void;
    textShadowEnabled: boolean;
    setTextShadowEnabled: (enabled: boolean) => void;
    textShadowColor: string;
    setTextShadowColor: (color: string) => void;
    textShadowBlur: number;
    setTextShadowBlur: (blur: number) => void;
    textShadowOffsetX: number;
    setTextShadowOffsetX: (offset: number) => void;
    textShadowOffsetY: number;
    setTextShadowOffsetY: (offset: number) => void;
    textShadowOpacity: number;
    setTextShadowOpacity: (opacity: number) => void;
    textAlign: 'left' | 'center' | 'right';
    setTextAlign: (align: 'left' | 'center' | 'right') => void;
    textLetterSpacing: number;
    setTextLetterSpacing: (spacing: number) => void;
    textLineHeight: number;
    setTextLineHeight: (lineHeight: number) => void;
    selectedItemId?: string | null;
}

const TextOptions: React.FC<TextOptionsProps> = ({
    textValue,
    setTextValue,
    textFontFamily,
    setTextFontFamily,
    textFontSize,
    setTextFontSize,
    textFill,
    setTextFill,
    textOpacity,
    setTextOpacity,
    textStrokeEnabled,
    setTextStrokeEnabled,
    textStrokeColor,
    setTextStrokeColor,
    textStrokeAlpha,
    setTextStrokeAlpha,
    textStrokeWidth,
    setTextStrokeWidth,
    textShadowEnabled,
    setTextShadowEnabled,
    textShadowColor,
    setTextShadowColor,
    textShadowBlur,
    setTextShadowBlur,
    textShadowOffsetX,
    setTextShadowOffsetX,
    textShadowOffsetY,
    setTextShadowOffsetY,
    textShadowOpacity,
    setTextShadowOpacity,
    textAlign,
    setTextAlign,
    textLetterSpacing,
    setTextLetterSpacing,
    textLineHeight,
    setTextLineHeight,
    selectedItemId,
}) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
            textAreaRef.current.select();
        }
    }, [selectedItemId]);

    return (
        <div className="space-y-3">
            <div>
                <div className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider font-fantasy">Content</div>
                <textarea
                    ref={textAreaRef}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-gold-500 resize-none"
                    rows={2}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    placeholder="Enter text..."
                />
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex-1">
                    <div className="text-xs text-zinc-400 mb-1 font-fantasy">Font</div>
                    <select
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:border-gold-500"
                        value={textFontFamily}
                        onChange={(e) => setTextFontFamily(e.target.value)}
                    >
                        {[
                            'IM Fell English SC, serif',
                            'Cinzel, serif',
                            'Playfair Display, serif',
                            'EB Garamond, serif',
                            'Marcellus SC, serif',
                            'Cormorant Garamond, serif'
                        ].map((font) => (
                            <option key={font} value={font}>{font.split(',')[0]}</option>
                        ))}
                    </select>
                </div>
            </div>

            <ColorPicker
                label="Fill"
                color={textFill}
                onChangeColor={setTextFill}
                alpha={textOpacity}
                onChangeAlpha={setTextOpacity}
            />

            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 font-fantasy">
                    <input
                        type="checkbox"
                        checked={textStrokeEnabled}
                        onChange={(e) => setTextStrokeEnabled(e.target.checked)}
                        className="accent-gold-500"
                    />
                    <span>Outline</span>
                </label>
                <ColorPicker
                    label="Outline Color"
                    color={textStrokeColor}
                    onChangeColor={setTextStrokeColor}
                    alpha={textStrokeAlpha}
                    onChangeAlpha={setTextStrokeAlpha}
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-fantasy">Outline Width</span>
                    <input
                        type="number"
                        min={0}
                        max={8}
                        step={0.5}
                        className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-gold-500"
                        value={textStrokeWidth}
                        onChange={(e) => setTextStrokeWidth(Number(e.target.value))}
                        disabled={!textStrokeEnabled}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs text-zinc-400 font-fantasy">
                    <input
                        type="checkbox"
                        checked={textShadowEnabled}
                        onChange={(e) => setTextShadowEnabled(e.target.checked)}
                        className="accent-gold-500"
                    />
                    <span>Shadow</span>
                </label>
                <ColorPicker
                    label="Shadow Color"
                    color={textShadowColor}
                    onChangeColor={setTextShadowColor}
                    alpha={textShadowOpacity}
                    onChangeAlpha={setTextShadowOpacity}
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-fantasy">Shadow Blur</span>
                    <input
                        type="number"
                        min={0}
                        max={30}
                        step={1}
                        className="w-16 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-gold-500"
                        value={textShadowBlur}
                        onChange={(e) => setTextShadowBlur(Number(e.target.value))}
                        disabled={!textShadowEnabled}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Shadow X</span>
                        <span>{textShadowOffsetX}</span>
                    </div>
                    <input
                        type="range"
                        min={-30}
                        max={30}
                        value={textShadowOffsetX}
                        onChange={(e) => setTextShadowOffsetX(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        disabled={!textShadowEnabled}
                    />
                </div>
                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Shadow Y</span>
                        <span>{textShadowOffsetY}</span>
                    </div>
                    <input
                        type="range"
                        min={-30}
                        max={30}
                        value={textShadowOffsetY}
                        onChange={(e) => setTextShadowOffsetY(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                        disabled={!textShadowEnabled}
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                    <span>Shadow Opacity</span>
                    <span>{Math.round(textShadowOpacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={textShadowOpacity}
                    onChange={(e) => setTextShadowOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    disabled={!textShadowEnabled}
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Letter Spacing</span>
                        <span>{textLetterSpacing}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={20}
                        value={textLetterSpacing}
                        onChange={(e) => setTextLetterSpacing(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                        <span>Line Height</span>
                        <span>{textLineHeight.toFixed(2)}</span>
                    </div>
                    <input
                        type="range"
                        min={0.8}
                        max={2}
                        step={0.05}
                        value={textLineHeight}
                        onChange={(e) => setTextLineHeight(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                    <span>Text Size</span>
                    <span>{textFontSize}</span>
                </div>
                <input
                    type="range"
                    min={8}
                    max={160}
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
            </div>

            <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-fantasy">
                    <span>Text Opacity</span>
                    <span>{Math.round(textOpacity * 100)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={textOpacity}
                    onChange={(e) => setTextOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
            </div>

            <div>
                <div className="text-xs text-zinc-400 mb-1 font-fantasy">Alignment</div>
                <div className="grid grid-cols-3 gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                            key={align}
                            onClick={() => setTextAlign(align)}
                            className={`py-1 text-xs rounded border ${textAlign === align ? 'bg-gold-600 text-white border-gold-500' : 'border-zinc-700 text-zinc-300 hover:border-gold-500/50'}`}
                        >
                            {align[0].toUpperCase() + align.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TextOptions;
