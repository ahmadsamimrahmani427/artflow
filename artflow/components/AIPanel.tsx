import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, AlertCircle, Layout, Check, X, Palette } from 'lucide-react';
import { useStore } from '../store';
import { generateAIEdit, generateNewImage, generateLayoutSuggestions, generateStyleSuggestions } from '../services/geminiService';

interface AIPanelProps {
    stageRef: React.RefObject<any>;
}

export const AIPanel: React.FC<AIPanelProps> = ({ stageRef }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'edit' | 'create'>('edit');
    const [error, setError] = useState<string | null>(null);

    const { addElement, addOrReplaceImage, canvasConfig, elements, setSuggestionPreview, suggestionPreview, applySuggestion, discardSuggestion } = useStore();

    // --- استفاده از کلید GEMINI API از .env ---
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set in .env.local");
    }

    const runWithAuthRetry = async (operation: () => Promise<void>) => {
        try {
            await operation();
        } catch (err: any) {
            console.error("Operation failed:", err);
            setError("API Key Error: لطفاً کلید API را بررسی کنید.");
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            await runWithAuthRetry(async () => {
                if (mode === 'edit') {
                    if (!stageRef.current) return;
                    const stage = stageRef.current;
                    const width = stage.width();
                    const height = stage.height();
                    const maxDim = 512;
                    const scale = Math.min(maxDim / width, maxDim / height, 1);
                    const dataURL = stage.toDataURL({ pixelRatio: scale, mimeType: 'image/jpeg', quality: 0.6 });

                    const newImageBase64 = await generateAIEdit(dataURL, prompt, GEMINI_API_KEY);

                    addOrReplaceImage({
                        type: 'image',
                        src: newImageBase64,
                        width: canvasConfig.width,
                        height: canvasConfig.height,
                        x: 0,
                        y: 0
                    }, true);
                } else {
                    const newImageBase64 = await generateNewImage(prompt, GEMINI_API_KEY);
                    addOrReplaceImage({
                        type: 'image',
                        src: newImageBase64,
                        width: canvasConfig.width,
                        height: canvasConfig.height,
                        x: 0,
                        y: 0
                    }, true);
                }
            });

            setPrompt('');
        } catch (err: any) {
            setError(err.message || "Generation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartLayout = async () => {
        if (elements.length === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const suggestedElements = await generateLayoutSuggestions(elements, canvasConfig, GEMINI_API_KEY);
            setSuggestionPreview(suggestedElements);
        } catch (err: any) {
            setError(err.message || "Could not generate layout. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartStyle = async () => {
        if (elements.length === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const suggestedElements = await generateStyleSuggestions(elements, canvasConfig, GEMINI_API_KEY);
            setSuggestionPreview(suggestedElements);
        } catch (err: any) {
            setError(err.message || "Could not generate styles. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (suggestionPreview) {
        return (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
                 <div className="bg-black/90 backdrop-blur-xl border border-brand-500/30 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 ring-1 ring-brand-500/20">
                     <div className="flex flex-col">
                         <span className="text-white font-bold text-sm flex items-center gap-2">
                             <Sparkles size={14} className="text-brand-400" /> AI Suggestion
                         </span>
                         <span className="text-gray-400 text-[10px] uppercase tracking-wide">Preview Mode</span>
                     </div>
                     <div className="h-8 w-px bg-white/10 mx-2" />
                     <button 
                        onClick={discardSuggestion}
                        className="p-2 rounded-full bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Discard"
                     >
                         <X size={20} />
                     </button>
                     <button 
                        onClick={applySuggestion}
                        className="px-6 py-2 rounded-full bg-brand-600 text-white font-bold text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2 active:scale-95"
                        title="Apply Changes"
                     >
                         <Check size={16} /> Apply
                     </button>
                 </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] md:w-[600px] z-50">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-brand-500/20 ring-1 ring-white/10">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2 overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => setMode('edit')}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${mode === 'edit' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                    >
                        <Wand2 size={12} /> Edit
                    </button>
                    <button 
                        onClick={() => setMode('create')}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${mode === 'create' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                    >
                        <Sparkles size={12} /> Create
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-1" />
                    
                    <button 
                        onClick={handleSmartLayout}
                        disabled={isLoading || elements.length === 0}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Optimize positions and sizes"
                    >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Layout size={12} />} 
                        Auto Layout
                    </button>
                    <button 
                        onClick={handleSmartStyle}
                        disabled={isLoading || elements.length === 0}
                        className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Optimize colors and fonts"
                    >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Palette size={12} />} 
                        Smart Style
                    </button>
                </div>

                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === 'edit' ? "Describe changes..." : "Describe image..."}
                        dir="auto"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none h-16"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-brand-500 to-purple-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    </button>
                </div>
                
                {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20" dir="auto">
                        <AlertCircle size={12} />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};
