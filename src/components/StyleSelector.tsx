import React from 'react';

export interface StyleOption {
    id: string;
    label: string;
    hasPrompt: boolean;
}

interface StyleSelectorProps {
    styles: StyleOption[];
    selectedStyle: string;
    onSelectStyle: (styleId: string) => void;
    imagesMap?: Record<string, string>;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({
    styles,
    selectedStyle,
    onSelectStyle,
    imagesMap
}) => {
    return (
        <div className="flex flex-wrap gap-2">
            {styles.map((style) => {
                const isSelected = style.id === selectedStyle;
                const hasImage = imagesMap && imagesMap[style.id];
                const isDisabled = !style.hasPrompt;

                return (
                    <button
                        key={style.id}
                        onClick={() => !isDisabled && onSelectStyle(style.id)}
                        disabled={isDisabled}
                        className={`
              relative px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-sm border transition-all
              ${isSelected
                                ? 'bg-amber-600 text-stone-900 border-amber-500 font-bold'
                                : isDisabled
                                    ? 'bg-stone-900/50 text-stone-600 border-stone-800 cursor-not-allowed opacity-50'
                                    : 'bg-stone-900 text-stone-400 border-stone-700 hover:border-amber-500/50 hover:text-amber-200'
                            }
            `}
                        title={isDisabled ? 'No prompt available' : style.label}
                    >
                        {style.label}
                        {hasImage && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-stone-900" title="Image generated" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default StyleSelector;
