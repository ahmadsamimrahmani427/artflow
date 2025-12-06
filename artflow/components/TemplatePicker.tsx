import React, { useState } from 'react';
import { X, Search, Check, Eye } from 'lucide-react';
import { TEMPLATES_DATA } from '../data/templates';
import { TemplateDesign } from '../types';

interface TemplatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: TemplateDesign) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('All');
    const [selectedPreview, setSelectedPreview] = useState<TemplateDesign | null>(null);
    
    if (!isOpen) return null;

    const categories = ['All', 'YouTube', 'Instagram', 'Facebook', 'Twitter', 'Business', 'Minimal', 'Colorful'];
    
    const filtered = TEMPLATES_DATA.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = category === 'All' || t.category === category;
        return matchesSearch && matchesCat;
    });

    const handleApply = () => {
        if (selectedPreview) {
            onSelect(selectedPreview);
            setSelectedPreview(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl flex flex-col relative animate-slide-up border border-slate-200 dark:border-white/10 overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Template Gallery</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Select a template to replace your current canvas</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Filter & Grid */}
                    <div className={`flex flex-col border-r border-slate-200 dark:border-white/10 transition-all duration-500 ${selectedPreview ? 'w-1/2 lg:w-2/5 hidden sm:flex' : 'w-full'}`}>
                         {/* Toolbar */}
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
                            <div className="relative w-full">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search templates..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                            category === cat 
                                            ? 'bg-brand-600 text-white' 
                                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-black/20 custom-scrollbar">
                            <div className={`grid gap-4 ${selectedPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                                {filtered.map(template => (
                                    <div 
                                        key={template.id}
                                        onClick={() => setSelectedPreview(template)}
                                        className={`group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border cursor-pointer ${selectedPreview?.id === template.id ? 'ring-2 ring-brand-500 border-transparent' : 'border-slate-200 dark:border-white/5'}`}
                                    >
                                        <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-700/50 relative overflow-hidden flex items-center justify-center p-2">
                                            <div 
                                                className="w-full h-full pointer-events-none"
                                                dangerouslySetInnerHTML={{ __html: template.svgContent.replace(/<svg /, '<svg style="width:100%; height:100%;" ') }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-xs mb-1 truncate">{template.name}</h3>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{template.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview Panel (Only visible if selected or on large screens) */}
                    {selectedPreview && (
                        <div className="w-full sm:w-1/2 lg:w-3/5 bg-slate-50 dark:bg-black/30 flex flex-col animate-fade-in absolute sm:relative inset-0 z-20 sm:z-auto">
                            {/* Mobile Back Button */}
                            <div className="sm:hidden p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
                                <button onClick={() => setSelectedPreview(null)} className="text-sm text-slate-500 hover:text-slate-900">
                                    ← Back to Gallery
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-hidden bg-dot-pattern">
                                <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 max-h-full max-w-full aspect-video bg-white">
                                    <div 
                                        className="w-full h-full"
                                        dangerouslySetInnerHTML={{ __html: selectedPreview.svgContent.replace(/<svg /, '<svg style="width:100%; height:100%;" ') }}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedPreview.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Optimized for {selectedPreview.category}</p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setSelectedPreview(null)}
                                        className="flex-1 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleApply}
                                        className="flex-1 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> Apply Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};