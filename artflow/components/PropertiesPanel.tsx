import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { SOCIAL_TEMPLATES } from '../types';
import { 
    Layers, Trash2, Eye, EyeOff, Move, Type, Droplet, Image as ImageIcon, Lock, Unlock, Square, Circle,
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, BoxSelect, Sun,
    GripVertical, LayoutTemplate, Upload, FlipHorizontal, FlipVertical
} from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
    const { elements, selectedId, updateElement, removeElement, saveToHistory, canvasConfig, setCanvasConfig, showGuides, toggleGuides } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedElement = elements.find(el => el.id === selectedId);

    // Update without saving history (for continuous input events like sliding)
    const handleUpdate = (key: string, value: any) => {
        if (!selectedId) return;
        updateElement(selectedId, { [key]: value });
    };

    // Save history then update (for discrete actions like clicks)
    const handleChangeWithHistory = (key: string, value: any) => {
        if (!selectedId) return;
        saveToHistory();
        updateElement(selectedId, { [key]: value });
    };

    // Save history manually (e.g., onMouseDown for sliders)
    const handleHistorySave = () => {
        saveToHistory();
    }
    
    const handleFlip = (direction: 'H' | 'V') => {
        if (!selectedElement) return;
        saveToHistory();
        if (direction === 'H') {
            updateElement(selectedElement.id, { scaleX: (selectedElement.scaleX || 1) * -1 });
        } else {
            updateElement(selectedElement.id, { scaleY: (selectedElement.scaleY || 1) * -1 });
        }
    };

    const toggleFontStyle = (style: string) => {
        if (!selectedElement) return;
        const currentStyle = selectedElement.fontStyle || 'normal';
        let newStyle = currentStyle;

        if (currentStyle.includes(style)) {
            newStyle = currentStyle.replace(style, '').trim();
        } else {
            if (currentStyle === 'normal') newStyle = style;
            else newStyle = `${currentStyle} ${style}`;
        }
        if (newStyle === '') newStyle = 'normal';
        handleChangeWithHistory('fontStyle', newStyle);
    };

    const hasStyle = (style: string) => (selectedElement?.fontStyle || '').includes(style);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && selectedId && selectedElement) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                     saveToHistory();
                     // Calculate new scale to maintain visual width
                     // currentVisualWidth = selectedElement.width * selectedElement.scaleX
                     // newVisualWidth = img.width * newScale
                     // => newScale = (selectedElement.width * selectedElement.scaleX) / img.width
                     
                     // We use the same scale for Y to preserve aspect ratio of NEW image
                     const currentVisualWidth = (selectedElement.width || 100) * (selectedElement.scaleX || 1);
                     const newScale = currentVisualWidth / img.width;

                     updateElement(selectedId, { 
                         src: reader.result as string,
                         width: img.width,
                         height: img.height,
                         scaleX: newScale,
                         scaleY: newScale
                     });
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // If no element selected, we still show the layers list at full height
    const showProperties = !!selectedElement;

    return (
        <div className="w-72 bg-white dark:bg-dark-surface border-l border-slate-200 dark:border-white/10 flex flex-col h-full overflow-hidden shadow-xl z-20 transition-colors duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {showProperties ? 'Properties' : 'Project Layers'}
                </span>
                {showProperties && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleChangeWithHistory('locked', !selectedElement.locked)}
                        className={`p-1.5 rounded-lg transition-colors ${selectedElement.locked ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500'}`}
                        title={selectedElement.locked ? "Unlock" : "Lock"}
                    >
                        {selectedElement.locked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                     <button 
                        onClick={() => removeElement(selectedElement.id)}
                        className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                )}
            </div>

            {/* Properties Section (Scrollable if content is long) */}
            {showProperties ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Transform Section */}
                    {!selectedElement.locked && (
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase mb-2">
                            <Move size={12} /> Transform
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput label="X" value={Math.round(selectedElement.x)} onChange={(v) => handleUpdate('x', v)} onFocus={handleHistorySave} />
                            <NumberInput label="Y" value={Math.round(selectedElement.y)} onChange={(v) => handleUpdate('y', v)} onFocus={handleHistorySave} />
                            <NumberInput label="W" value={Math.round((selectedElement.width || 0) * (selectedElement.scaleX || 1))} onChange={(v) => handleUpdate('scaleX', v / (selectedElement.width || 1))} onFocus={handleHistorySave} />
                            <NumberInput label="H" value={Math.round((selectedElement.height || 0) * (selectedElement.scaleY || 1))} onChange={(v) => handleUpdate('scaleY', v / (selectedElement.height || 1))} onFocus={handleHistorySave} />
                            
                            {/* Rotation & Flip */}
                            <div className="col-span-2 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-slate-500 dark:text-gray-400">Rotation</label>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">{Math.round(selectedElement.rotation || 0)}°</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-180" 
                                        max="180" 
                                        value={selectedElement.rotation || 0}
                                        onPointerDown={handleHistorySave}
                                        onChange={(e) => handleUpdate('rotation', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer thumb-brand"
                                    />
                                </div>
                                
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleFlip('H')}
                                        className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                        title="Flip Horizontal"
                                    >
                                        <FlipHorizontal size={14} /> Flip H
                                    </button>
                                    <button 
                                        onClick={() => handleFlip('V')}
                                        className="flex-1 py-1.5 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                        title="Flip Vertical"
                                    >
                                        <FlipVertical size={14} /> Flip V
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                    
                    {/* Image Source Section */}
                    {selectedElement.type === 'image' && (
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase mb-2">
                                <ImageIcon size={12} /> Image Source
                            </div>
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload size={14} /> Replace Image
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            
                            {!selectedElement.src && (
                                <div className="text-[10px] text-amber-500 flex items-center gap-1 bg-amber-500/10 p-2 rounded">
                                    This is a placeholder. Upload an image to fill it.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Text Specific */}
                    {selectedElement.type === 'text' && (
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase mb-2">
                                <Type size={12} /> Typography
                            </div>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-500 dark:text-gray-400">Content</label>
                                    <textarea 
                                        value={selectedElement.text} 
                                        dir="auto"
                                        onFocus={handleHistorySave}
                                        onChange={(e) => handleUpdate('text', e.target.value)}
                                        className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 resize-none"
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-500 dark:text-gray-400">Font</label>
                                        <select 
                                            value={selectedElement.fontFamily || 'Inter'}
                                            onClick={handleHistorySave}
                                            onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded p-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                                        >
                                            <option value="Inter">Inter (English)</option>
                                            <option value="Vazirmatn">Vazirmatn (Farsi)</option>
                                            <option value="Poppins">Poppins</option>
                                            <option value="Arial">Arial</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier</option>
                                        </select>
                                    </div>
                                    <NumberInput label="Size" value={selectedElement.fontSize || 16} onChange={(v) => handleUpdate('fontSize', v)} onFocus={handleHistorySave} />
                                </div>

                                {/* Style & Align */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex bg-slate-100 dark:bg-black/20 rounded-lg p-1 border border-slate-200 dark:border-white/10">
                                        <IconButton active={hasStyle('bold')} onClick={() => toggleFontStyle('bold')} icon={<Bold size={14} />} />
                                        <IconButton active={hasStyle('italic')} onClick={() => toggleFontStyle('italic')} icon={<Italic size={14} />} />
                                        <IconButton active={selectedElement.textDecoration === 'underline'} onClick={() => handleChangeWithHistory('textDecoration', selectedElement.textDecoration === 'underline' ? '' : 'underline')} icon={<Underline size={14} />} />
                                    </div>
                                    <div className="flex bg-slate-100 dark:bg-black/20 rounded-lg p-1 border border-slate-200 dark:border-white/10">
                                        <IconButton active={selectedElement.align === 'left'} onClick={() => handleChangeWithHistory('align', 'left')} icon={<AlignLeft size={14} />} />
                                        <IconButton active={selectedElement.align === 'center'} onClick={() => handleChangeWithHistory('align', 'center')} icon={<AlignCenter size={14} />} />
                                        <IconButton active={selectedElement.align === 'right'} onClick={() => handleChangeWithHistory('align', 'right')} icon={<AlignRight size={14} />} />
                                        <IconButton active={selectedElement.align === 'justify'} onClick={() => handleChangeWithHistory('align', 'justify')} icon={<AlignJustify size={14} />} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Section (Fill, Opacity) */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase mb-2">
                            <Droplet size={12} /> Appearance
                        </div>
                        
                        <div className="space-y-4">
                            {(selectedElement.type === 'rect' || selectedElement.type === 'text' || selectedElement.type === 'circle') && (
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-slate-500 dark:text-gray-400">Fill Color</label>
                                    <ColorPicker value={selectedElement.fill || '#000000'} onChange={(v) => handleChangeWithHistory('fill', v)} />
                                </div>
                            )}
                            
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs text-slate-500 dark:text-gray-400">Opacity</label>
                                    <span className="text-xs text-slate-500 dark:text-gray-400">{Math.round((selectedElement.opacity || 1) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.01"
                                    value={selectedElement.opacity ?? 1}
                                    onPointerDown={handleHistorySave}
                                    onChange={(e) => handleUpdate('opacity', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stroke / Outline */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase">
                                <BoxSelect size={12} /> Stroke
                            </div>
                        </div>
                        <div className="grid grid-cols-[1fr,auto] gap-3 items-center">
                            <div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="20" 
                                    value={selectedElement.strokeWidth || 0}
                                    onPointerDown={handleHistorySave}
                                    onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-[10px] text-slate-400 text-right mt-1">{selectedElement.strokeWidth || 0}px</div>
                            </div>
                            <ColorPicker value={selectedElement.stroke || '#000000'} onChange={(v) => handleChangeWithHistory('stroke', v)} />
                        </div>
                    </div>

                    {/* Shadow */}
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase">
                            <Sun size={12} /> Shadow
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Color</label>
                                <ColorPicker value={selectedElement.shadowColor || '#000000'} onChange={(v) => handleChangeWithHistory('shadowColor', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberInput label="Blur" value={selectedElement.shadowBlur || 0} onChange={(v) => handleUpdate('shadowBlur', v)} onFocus={handleHistorySave} />
                                <NumberInput label="Opac" value={(selectedElement.shadowOpacity || 1) * 100} onChange={(v) => handleUpdate('shadowOpacity', v / 100)} onFocus={handleHistorySave} />
                                <NumberInput label="X" value={selectedElement.shadowOffsetX || 0} onChange={(v) => handleUpdate('shadowOffsetX', v)} onFocus={handleHistorySave} />
                                <NumberInput label="Y" value={selectedElement.shadowOffsetY || 0} onChange={(v) => handleUpdate('shadowOffsetY', v)} onFocus={handleHistorySave} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Canvas Settings when no layer selected
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-white/50 text-xs font-semibold uppercase">
                            <LayoutTemplate size={12} /> Canvas Settings
                        </div>
                        
                        {/* Preset Selector */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500 dark:text-gray-400">Template Preset</label>
                            <select 
                                value={canvasConfig.id}
                                onChange={(e) => {
                                    const tmpl = SOCIAL_TEMPLATES.find(t => t.id === e.target.value);
                                    if(tmpl) setCanvasConfig(tmpl);
                                }}
                                className="w-full bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                            >
                                <optgroup label="Instagram">
                                    {SOCIAL_TEMPLATES.filter(t => t.category === 'Instagram').map(t => <option key={t.id} value={t.id}>{t.name} ({t.width}x{t.height})</option>)}
                                </optgroup>
                                <optgroup label="YouTube">
                                    {SOCIAL_TEMPLATES.filter(t => t.category === 'YouTube').map(t => <option key={t.id} value={t.id}>{t.name} ({t.width}x{t.height})</option>)}
                                </optgroup>
                                <optgroup label="Facebook">
                                    {SOCIAL_TEMPLATES.filter(t => t.category === 'Facebook').map(t => <option key={t.id} value={t.id}>{t.name} ({t.width}x{t.height})</option>)}
                                </optgroup>
                                <optgroup label="Twitter">
                                    {SOCIAL_TEMPLATES.filter(t => t.category === 'Twitter').map(t => <option key={t.id} value={t.id}>{t.name} ({t.width}x{t.height})</option>)}
                                </optgroup>
                            </select>
                        </div>

                        {/* Dimensions Display (Read-only for now based on preset) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Width</div>
                                <div className="text-sm font-mono">{canvasConfig.width}px</div>
                            </div>
                             <div className="bg-slate-100 dark:bg-black/20 rounded-lg p-2 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Height</div>
                                <div className="text-sm font-mono">{canvasConfig.height}px</div>
                            </div>
                        </div>

                        {/* Guides Toggle */}
                        <div className="flex items-center justify-between pt-2">
                            <label className="text-xs text-slate-500 dark:text-gray-400 font-medium">Show Safe Areas</label>
                            <button 
                                onClick={toggleGuides}
                                className={`w-10 h-5 rounded-full relative transition-colors ${showGuides ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${showGuides ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        {/* Hint */}
                         {canvasConfig.safeAreas && canvasConfig.safeAreas.length > 0 && showGuides && (
                            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg text-[10px] text-brand-600 dark:text-brand-400 leading-relaxed">
                                <strong>Tip:</strong> Safe areas show where content is guaranteed to be visible on all devices. Keep text inside green/blue zones.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Layers List (always visible at bottom) */}
            <div className={`flex flex-col border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/10 transition-all duration-300 ${showProperties ? 'h-1/3 min-h-[200px]' : 'flex-1'}`}>
                <div className="p-3 text-xs font-semibold text-slate-500 dark:text-white/70 flex items-center gap-2 sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-white/5 shrink-0">
                    <Layers size={14} /> Layers
                </div>
                <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    <LayersList />
                </div>
            </div>
        </div>
    );
};

/* --- Helper Components --- */

const IconButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
        onClick={onClick}
        className={`p-1.5 rounded-md transition-all ${active ? 'bg-white dark:bg-white/20 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-white'}`}
    >
        {icon}
    </button>
);

const ColorPicker = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-md">
        <input 
            type="color" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
        />
        <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 w-14">{value}</span>
    </div>
);

const NumberInput = ({ label, value, onChange, onFocus }: { label: string, value: number, onChange: (val: number) => void, onFocus?: () => void }) => (
    <div className="flex items-center bg-slate-100 dark:bg-black/20 rounded-lg border border-slate-200 dark:border-white/5 focus-within:border-brand-500/50 transition-colors">
        <div className="px-2 py-1.5 text-[10px] text-slate-500 dark:text-gray-500 border-r border-slate-200 dark:border-white/5 select-none cursor-ew-resize w-8 text-center">{label}</div>
        <input 
            type="number" 
            value={value} 
            onFocus={onFocus}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-transparent p-1.5 text-xs text-slate-900 dark:text-white focus:outline-none text-right appearance-none"
        />
    </div>
);

/* --- Drag & Drop Layers List --- */

const LayersList = () => {
    const { elements, selectedId, selectElement, updateElement, moveElement, saveToHistory } = useStore();
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // Visual order: Top layer first (last in array)
    const reversed = [...elements].reverse();

    const handleToggleVisible = (e: React.MouseEvent, id: string, current: boolean) => {
        e.stopPropagation();
        saveToHistory();
        updateElement(id, { visible: !current });
    };

    const handleToggleLock = (e: React.MouseEvent, id: string, current: boolean) => {
        e.stopPropagation();
        saveToHistory();
        updateElement(id, { locked: !current });
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault(); // Allow dropping
        e.dataTransfer.dropEffect = 'move';
        if (dragOverId !== id) setDragOverId(id);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Prevent clearing if moving into a child element (e.g. icon or text inside the row)
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverId(null);
        setDraggingId(null);

        if (!draggingId || draggingId === targetId) return;

        // Calculate actual indices in the store's elements array
        // elements array: [0: Bottom, ..., Length-1: Top]
        const fromIndex = elements.findIndex(el => el.id === draggingId);
        const toIndex = elements.findIndex(el => el.id === targetId);
        
        moveElement(draggingId, toIndex);
    };

    return (
        <>
            {reversed.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 dark:text-gray-600">No layers</div>
            )}
            {reversed.map((el) => {
                const isSelected = selectedId === el.id;
                const isVisible = el.visible !== false;
                const isLocked = el.locked === true;
                const isDragging = draggingId === el.id;
                const isDragOver = dragOverId === el.id;

                return (
                    <div 
                        key={el.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, el.id)}
                        onDragOver={(e) => handleDragOver(e, el.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, el.id)}
                        onClick={() => selectElement(el.id)}
                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border border-l-4
                        ${isSelected 
                            ? 'bg-brand-50/50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 border-l-brand-500' 
                            : 'border-transparent border-l-transparent hover:bg-slate-100 dark:hover:bg-white/5'}
                        ${isDragging ? 'opacity-40 grayscale' : ''}
                        ${isDragOver && !isDragging ? 'border-t-2 border-t-brand-500 bg-brand-50 dark:bg-brand-900/20' : ''}
                        `}
                    >
                        {/* Drag Handle */}
                        <div className="cursor-grab text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} />
                        </div>

                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/40'}`}>
                            {el.type === 'text' && <Type size={14} />}
                            {el.type === 'image' && <ImageIcon size={14} />}
                            {el.type === 'rect' && <Square size={14} />}
                            {el.type === 'circle' && <Circle size={14} />}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center select-none">
                            <div className={`text-xs truncate font-medium leading-none mb-1 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-gray-300'}`}>
                                {el.type === 'text' ? (el.text || 'Text Layer') : 
                                 el.type === 'image' ? 'Image' : 
                                 el.type === 'circle' ? 'Circle' : 'Rectangle'}
                            </div>
                        </div>
                        
                        {/* Toggles */}
                        <div className={`flex items-center gap-1 ${isSelected || !isVisible || isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity border-l border-slate-200 dark:border-white/10 pl-1`}>
                             <button 
                                onClick={(e) => handleToggleLock(e, el.id, !!el.locked)}
                                className={`p-1 rounded transition-colors ${isLocked ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/20' : 'text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                title={isLocked ? "Unlock" : "Lock"}
                            >
                                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>
                            
                            <button 
                                onClick={(e) => handleToggleVisible(e, el.id, !!isVisible)}
                                className={`p-1 rounded transition-colors ${!isVisible ? 'text-slate-400 dark:text-gray-500' : 'text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                title={isVisible ? "Show" : "Hide"}
                            >
                                {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                        </div>
                    </div>
                );
            })}
        </>
    );
}