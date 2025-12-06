import React, { useState, useRef } from 'react';
import { Search, X, Sticker, Grid, Smile, Heart, Award, Share2, Upload, Trash2 } from 'lucide-react';
import { STICKERS_DATA } from '../data/stickers';
import { useStore } from '../store';
import { StickerItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface StickersPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StickersPanel: React.FC<StickersPanelProps> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('All');
    const { customAssets, addCustomAsset } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const categories = [
        { id: 'All', icon: <Grid size={14} /> },
        { id: 'Social', icon: <Share2 size={14} /> },
        { id: 'Shapes', icon: <Sticker size={14} /> },
        { id: 'Emoji', icon: <Smile size={14} /> },
        { id: 'Decorative', icon: <Heart size={14} /> },
        { id: 'Badge', icon: <Award size={14} /> },
        { id: 'Custom', icon: <Upload size={14} /> }
    ];

    const isCustom = category === 'Custom';

    const itemsToDisplay = isCustom ? customAssets : STICKERS_DATA;

    const filtered = itemsToDisplay.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = isCustom || category === 'All' || s.category === category;
        return matchesSearch && matchesCat;
    });

    const handleDragStart = (e: React.DragEvent, sticker: StickerItem) => {
        let src = sticker.url;
        // If SVG raw string, convert to data URI
        if (sticker.type === 'svg' && !src.startsWith('data:')) {
             src = `data:image/svg+xml;base64,${btoa(sticker.url)}`;
        }

        // Send sticker data as JSON string
        const dragData = JSON.stringify({
            type: 'sticker',
            src: src,
            width: 150, // Default width
            height: 150
        });
        e.dataTransfer.setData('application/json', dragData);
        e.dataTransfer.effectAllowed = 'copy';
        
        // Optional: Set drag image
        const div = document.createElement('div');
        if (sticker.type === 'svg') {
            div.innerHTML = sticker.url;
            const svg = div.firstChild as SVGSVGElement;
            if(svg) {
                svg.setAttribute('width', '50');
                svg.setAttribute('height', '50');
            }
        } else {
            const img = document.createElement('img');
            img.src = sticker.url;
            img.width = 50;
            img.height = 50;
            div.appendChild(img);
        }
        
        document.body.appendChild(div);
        e.dataTransfer.setDragImage(div, 25, 25);
        setTimeout(() => document.body.removeChild(div), 0);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                addCustomAsset({
                    id: uuidv4(),
                    name: file.name,
                    category: 'Custom',
                    type: 'image',
                    url: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="absolute left-16 md:left-20 top-0 bottom-0 w-72 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-white/10 shadow-xl z-10 flex flex-col animate-slide-in-right transform origin-left">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sticker size={18} className="text-brand-500" /> Stickers
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search stickers..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide border-b border-slate-200 dark:border-white/5">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                            category === cat.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                    >
                        {cat.icon} {cat.id}
                    </button>
                ))}
            </div>

            {/* Custom Upload Button */}
            {isCustom && (
                <div className="p-4 pb-0">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-slate-100 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-brand-500 transition-all flex items-center justify-center gap-2"
                    >
                        <Upload size={14} /> Upload Custom Sticker
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,.svg"
                        onChange={handleFileUpload}
                    />
                </div>
            )}

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                    {filtered.map(sticker => (
                        <div 
                            key={sticker.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, sticker)}
                            className="aspect-square bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center p-2 cursor-grab hover:bg-slate-100 dark:hover:bg-white/10 hover:scale-105 transition-all border border-transparent hover:border-brand-500/30 relative overflow-hidden group"
                            title={sticker.name}
                        >
                             {sticker.type === 'svg' ? (
                                <div 
                                    className="w-full h-full pointer-events-none"
                                    dangerouslySetInnerHTML={{ __html: sticker.url.replace(/<svg /, '<svg style="width:100%; height:100%;" ') }}
                                />
                             ) : (
                                <img src={sticker.url} alt={sticker.name} className="w-full h-full object-contain pointer-events-none" />
                             )}
                             
                             {/* Optional delete for custom assets (Not fully implemented in store but UI hint) */}
                             {isCustom && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* <button className="p-1 bg-red-500 text-white rounded-full"><Trash2 size={10} /></button> */}
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        {isCustom ? 'No custom stickers yet' : 'No stickers found'}
                    </div>
                )}
            </div>
        </div>
    );
};