import React, { useRef, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToolsPanel } from './components/ToolsPanel';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AIPanel } from './components/AIPanel';
import { TemplatePicker } from './components/TemplatePicker';
import { StickersPanel } from './components/StickersPanel';
// Removed SubscriptionModal import
import { AuthModal } from './components/AuthModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { SOCIAL_TEMPLATES, TemplateDesign } from './types';
import { TEMPLATES_DATA } from './data/templates';
import { parseTemplate } from './utils/templateParser';
import { exportToSVG } from './utils/svgExporter';
import { useStore } from './store';
import { 
    Image as ImageIcon, Download, Palette, Menu, Check, Star, Zap, Shield, ArrowRight, FolderOpen,
    Youtube, Instagram, Facebook, Sparkles, LayoutTemplate, Wand2, Undo2, Redo2, Grid, Sun, Moon,
    ChevronDown, Settings, Loader2, Lock, Save, Trash2, Edit2, Clock
} from 'lucide-react';

/* --- Editor Page (Standalone Layout) --- */
const EditorPage = () => {
    const stageRef = useRef<any>(null);
    const { undo, redo, past, future, showGuides, toggleGuides, theme, toggleTheme, setElements, canvasConfig, saveToHistory, userTier, elements, user, initAuth } = useStore();
    
    // Panel State
    const [activePanel, setActivePanel] = useState<string | null>(null);

    // Export State
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportConfig, setExportConfig] = useState({
        format: 'image/png',
        quality: 100, // Default to max
        scale: 1, 
        transparent: false
    });

    // Modals
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        initAuth();
    }, []);

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
                return;
            }

            const { undo, redo, removeElement, selectedId, copy, paste } = useStore.getState();
            const isCtrlOrMeta = e.ctrlKey || e.metaKey;

            if (isCtrlOrMeta) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) redo(); else undo();
                }
                if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
                if (e.key.toLowerCase() === 'c') { e.preventDefault(); copy(); }
                if (e.key.toLowerCase() === 'v') { e.preventDefault(); paste(); }
                if (e.key.toLowerCase() === 's') { e.preventDefault(); handleSaveClick(); }
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    e.preventDefault();
                    removeElement(selectedId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleApplyTemplate = (design: TemplateDesign) => {
        saveToHistory();
        const newElements = parseTemplate(design.svgContent, canvasConfig.width, canvasConfig.height);
        setElements(newElements);
        setShowTemplates(false);
    };
    
    // Removed permissions check - all features unlocked

    const handleSaveClick = () => {
        if (!user) {
            setShowAuthModal(true);
        } else {
            setShowSaveModal(true);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            try {
                let dataUrl = '';
                let ext = 'png';

                if (exportConfig.format === 'image/svg+xml') {
                     const svgString = exportToSVG(elements, canvasConfig);
                     const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                     dataUrl = URL.createObjectURL(blob);
                     ext = 'svg';
                } else {
                    if (!stageRef.current) {
                        setIsExporting(false);
                        return;
                    }
                    const stage = stageRef.current;
                    const bgLayer = stage.find('.background-rect')[0];
                    const guidesLayer = stage.find('.guides-layer')[0];
                    // Watermark layer removed from canvas, so no need to handle here
                    const oldBgVisible = bgLayer?.visible();
                    const oldGuidesVisible = guidesLayer?.visible();

                    if (exportConfig.transparent && (exportConfig.format === 'image/png' || exportConfig.format === 'image/webp')) {
                        bgLayer?.hide();
                    }
                    guidesLayer?.hide();
                    
                    dataUrl = stage.toDataURL({
                        pixelRatio: exportConfig.scale,
                        mimeType: exportConfig.format,
                        quality: exportConfig.quality / 100
                    });
                    ext = exportConfig.format.split('/')[1];
                    
                    if (bgLayer && oldBgVisible !== undefined) bgLayer.visible(oldBgVisible);
                    if (guidesLayer && oldGuidesVisible !== undefined) guidesLayer.visible(oldGuidesVisible);
                }

                const link = document.createElement('a');
                link.download = `artflow-export-${Date.now()}.${ext}`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (ext === 'svg') URL.revokeObjectURL(dataUrl);
                setShowExportMenu(false);

            } catch (e) {
                console.error("Export failed:", e);
                alert("Export failed. Please try a lower resolution.");
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white transition-colors duration-300">
            {/* Editor Header */}
            <header className="h-14 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-dark-surface flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm dark:shadow-md transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center">
                            <Palette size={16} className="text-white" />
                        </div>
                        <span className="font-bold hidden md:block text-slate-900 dark:text-white">ArtFlow</span>
                    </Link>
                    <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block" />

                    <button 
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors font-medium text-xs border border-brand-200 dark:border-brand-500/20"
                    >
                        <LayoutTemplate size={16} />
                        <span className="hidden sm:inline">Templates</span>
                    </button>
                    
                    <button 
                        onClick={handleSaveClick}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium text-xs"
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">Save</span>
                    </button>

                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200 dark:border-white/5">
                        <button onClick={undo} disabled={past.length === 0} className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-white/10 rounded-md disabled:opacity-30 transition-all"><Undo2 size={18} /></button>
                        <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-0.5" />
                        <button onClick={redo} disabled={future.length === 0} className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-white/10 rounded-md disabled:opacity-30 transition-all"><Redo2 size={18} /></button>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-100 dark:bg-black/20 p-1 rounded-lg border border-slate-200 dark:border-white/5">
                    <button onClick={toggleGuides} className={`p-1.5 rounded-md transition-all ${showGuides ? 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400' : 'text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white'}`}><Grid size={16} /></button>
                </div>

                <div className="flex items-center gap-3 relative">
                     <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
                    
                    <div className="relative z-50">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition-all shadow-md active:scale-95">
                            <Download size={16} /> <span className="hidden sm:inline">Export</span> <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-dark-surface border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-4 animate-fade-in z-50">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                                    <h3 className="font-semibold text-sm">Export Settings</h3>
                                    <Settings size={14} className="text-slate-400" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 font-medium">Format</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['image/png', 'image/jpeg', 'image/webp'].map((fmt) => (
                                                <button key={fmt} onClick={() => setExportConfig({ ...exportConfig, format: fmt })} className={`px-2 py-1.5 text-xs rounded-md border transition-all ${exportConfig.format === fmt ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>{fmt.split('/')[1].toUpperCase()}</button>
                                            ))}
                                            <button onClick={() => setExportConfig({ ...exportConfig, format: 'image/svg+xml' })} className={`px-2 py-1.5 text-xs rounded-md border transition-all flex items-center justify-center gap-1 ${exportConfig.format === 'image/svg+xml' ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>SVG</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 font-medium">Resolution</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3, 4].map((s) => (
                                                <button key={s} onClick={() => setExportConfig({ ...exportConfig, scale: s })} className={`px-2 py-1.5 text-xs rounded-md border transition-all flex items-center justify-center gap-1 ${exportConfig.scale === s ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>{s}x</button>
                                            ))}
                                        </div>
                                    </div>
                                    {exportConfig.format === 'image/jpeg' && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs"><label className="text-slate-500 font-medium">Quality</label><span>{exportConfig.quality}%</span></div>
                                            <input type="range" min="60" max="100" value={exportConfig.quality} onChange={(e) => setExportConfig({ ...exportConfig, quality: parseInt(e.target.value) })} className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                                        </div>
                                    )}
                                    {exportConfig.format !== 'image/jpeg' && exportConfig.format !== 'image/svg+xml' && (
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs text-slate-500 font-medium flex items-center gap-1">Transparent Background</label>
                                            <button onClick={() => setExportConfig({ ...exportConfig, transparent: !exportConfig.transparent })} className={`w-10 h-5 rounded-full relative transition-colors ${exportConfig.transparent ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10'}`}><div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${exportConfig.transparent ? 'translate-x-5' : ''}`} /></button>
                                        </div>
                                    )}
                                    <button onClick={handleExport} disabled={isExporting} className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                        {isExporting ? <><Loader2 size={16} className="animate-spin" /> Rendering...</> : <>Download File</>}
                                    </button>
                                </div>
                                <div className="fixed inset-0 -z-10" onClick={() => setShowExportMenu(false)} />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <ToolsPanel activePanel={activePanel} setActivePanel={setActivePanel} />
                <StickersPanel isOpen={activePanel === 'stickers'} onClose={() => setActivePanel(null)} />
                <CanvasArea stageRef={stageRef} />
                <PropertiesPanel />
                <AIPanel stageRef={stageRef} />
                <TemplatePicker isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleApplyTemplate} />
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
                <SaveProjectModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} stageRef={stageRef} />
            </div>
        </div>
    );
};

/* --- Projects Page --- */
const ProjectsPage = () => {
    const { projects, loadProjects, user, isLoadingProjects, loadProjectIntoCanvas, deleteProject } = useStore();
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);

    useEffect(() => {
        if (user) loadProjects();
    }, [user]);

    const handleOpenProject = (id: string) => {
        loadProjectIntoCanvas(id);
        navigate('/editor');
    };

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 w-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <FolderOpen size={40} className="text-slate-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Please Log In</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">You need to be signed in to access and save your projects.</p>
                <button 
                    onClick={() => setAuthModalOpen(true)}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors"
                >
                    Sign In / Sign Up
                </button>
                <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Projects</h1>
                <Link to="/editor" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors font-medium text-sm flex items-center gap-2">
                    <FolderOpen size={16} /> New Project
                </Link>
            </div>

            {isLoadingProjects ? (
                <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-brand-500" /></div>
            ) : projects.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-white/5">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 text-slate-400">
                        <FolderOpen size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Start creating amazing banners and they will appear here.</p>
                    <Link to="/editor" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Open Editor</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="aspect-video bg-slate-100 dark:bg-black/20 relative overflow-hidden">
                                {project.thumbnail ? (
                                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={32} /></div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => handleOpenProject(project.id)}
                                        className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform" 
                                        title="Open in Editor"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => deleteProject(project.id)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform" 
                                        title="Delete Project"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{project.name}</h3>
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.updatedAt).toLocaleDateString()}</span>
                                    <span>{project.config.name}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* --- Marketing Pages --- */
const LandingPage = () => {
    return (
        <div className="w-full overflow-hidden">
            {/* Hero Section */}
            <section className="relative w-full px-6 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -z-10 opacity-50 dark:opacity-20 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] -z-10 opacity-50 dark:opacity-20" />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8 animate-fade-in backdrop-blur-md">
                    <Sparkles size={14} /> <span>AI-Powered Design Studio</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.1]">
                    Create Viral <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 animate-gradient-x">Social Graphics</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">Stop struggling with complex tools. Use ArtFlow's AI to generate professional YouTube thumbnails, Instagram posts, and more in seconds.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Link to="/editor" className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] flex items-center justify-center gap-2 overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">Start Creating <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </Link>
                    <Link to="/templates" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium text-lg hover:bg-white/80 dark:hover:bg-white/10 transition-all backdrop-blur-sm">View Gallery</Link>
                </div>
            </section>

            {/* Template Features Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Optimized for Every Platform</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Pre-sized templates with safe zones for all your favorite social media networks.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <TemplateFeatureCard title="YouTube Thumbnails" description="High CTR layouts with safe zones for timestamps." icon={<Youtube size={32} />} gradient="from-red-500 to-orange-500" delay="0"/>
                    <TemplateFeatureCard title="Instagram Posts" description="Square & Portrait modes perfect for feeds and carousels." icon={<Instagram size={32} />} gradient="from-purple-500 to-pink-500" delay="100"/>
                    <TemplateFeatureCard title="Facebook Covers" description="Responsive banners that look great on mobile and desktop." icon={<Facebook size={32} />} gradient="from-blue-600 to-brand-500" delay="200"/>
                </div>
            </section>
            
            {/* General Features Grid */}
            <section className="w-full bg-slate-100 dark:bg-slate-900/50 py-24 border-y border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                     <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why Creators Love ArtFlow</h2></div>
                     <div className="grid md:grid-cols-3 gap-8 text-left">
                        <FeatureCard icon={<Wand2 size={24} />} title="AI Magic Edit" description="Type instructions like 'Make it sunny' or 'Add a neon glow' to instantly transform images." color="brand"/>
                        <FeatureCard icon={<LayoutTemplate size={24} />} title="Smart Safe Zones" description="Never worry about cropped text again. Our editor shows you exactly where to place content." color="purple"/>
                        <FeatureCard icon={<Zap size={24} />} title="Lightning Fast" description="Built on Gemini 2.5 Flash for instant generation and real-time editing response." color="pink"/>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="w-full px-6 py-32 text-center">
                 <div className="max-w-4xl mx-auto bg-gradient-to-tr from-brand-900 to-slate-900 rounded-3xl p-12 relative overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to create your next viral post?</h2>
                        <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto">Join thousands of creators using ArtFlow to save time and look professional.</p>
                        <Link to="/editor" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-brand-900 font-bold text-lg hover:bg-brand-50 transition-colors">Open Editor Now <ArrowRight size={20} /></Link>
                    </div>
                 </div>
            </section>
        </div>
    );
};

const TemplateFeatureCard = ({ title, description, icon, gradient, delay }: any) => (
    <div className="group relative p-1 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:from-brand-500 hover:to-purple-600 transition-all duration-500 hover:-translate-y-2" style={{ animationDelay: `${delay}ms` }}>
        <div className="relative h-full bg-slate-50 dark:bg-slate-950 rounded-[22px] p-8 flex flex-col items-center text-center overflow-hidden">
             <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
             <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>{icon}</div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">{title}</h3>
             <p className="text-slate-500 dark:text-slate-400 relative z-10">{description}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, description, color }: any) => {
    const colors: any = {
        brand: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20"
    };

    return (
        <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-xl transition-all group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors[color]}`}>{icon}</div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </div>
    );
}

const TemplatesPage = () => {
    const { setCanvasConfig, setElements, saveToHistory } = useStore();
    const navigate = useNavigate();
    const [category, setCategory] = useState('All');
    const categories = ['All', 'YouTube', 'Instagram', 'Facebook', 'Business', 'Minimal', 'Colorful', 'Twitter'];
    const filtered = TEMPLATES_DATA.filter(t => category === 'All' || t.category === category);

    const handleSelectTemplate = (tmpl: TemplateDesign) => {
        const preset = SOCIAL_TEMPLATES.find(t => t.category === tmpl.category) || SOCIAL_TEMPLATES[0];
        setCanvasConfig(preset);
        saveToHistory();
        const newElements = parseTemplate(tmpl.svgContent, preset.width, preset.height);
        setElements(newElements);
        navigate('/editor');
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Choose a Template</h1>
                <p className="text-slate-600 dark:text-slate-400">Start with a professional layout optimized for social media</p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap mb-12">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}`}>{cat}</button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filtered.map((tmpl) => (
                    <div key={tmpl.id} onClick={() => handleSelectTemplate(tmpl)} className="group relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-brand-500/50 transition-all cursor-pointer duration-300">
                        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700/30 flex items-center justify-center p-6">
                             <div className="w-full h-full shadow-lg pointer-events-none transform transition-transform group-hover:scale-105 duration-500" dangerouslySetInnerHTML={{ __html: tmpl.svgContent.replace(/<svg /, '<svg style="width:100%; height:100%;" ') }} />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <span className="px-6 py-3 bg-white text-black rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">Use Template</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-black/80 backdrop-blur-md border-t border-white/10">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{tmpl.name}</h3>
                            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{tmpl.category}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PricingPage = () => {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Simple, Transparent Pricing</h1>
                <p className="text-slate-600 dark:text-slate-400">Start for free, upgrade for power.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <PricingCard title="Starter" price="$0" features={['5 Projects', 'Standard Templates', 'Watermarked Exports', 'Basic Support']} />
                <PricingCard title="Pro" price="$12" period="/mo" featured={true} features={['Unlimited Projects', 'Premium AI Tools', 'Retina 4K Export', 'No Watermark', 'Priority Support']} />
                <PricingCard title="Team" price="$49" period="/mo" features={['Everything in Pro', '5 Team Members', 'Shared Assets', 'Brand Kit', 'SSO']} />
            </div>
        </div>
    );
};

const PricingCard = ({ title, price, period = '', features, featured = false }: any) => (
    <div className={`relative p-8 rounded-3xl border flex flex-col ${featured ? 'bg-slate-900 text-white border-slate-800 dark:bg-brand-900/20 dark:border-brand-500/50 shadow-2xl scale-105 z-10' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'}`}>
        {featured && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-brand-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Most Popular</div>}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline mb-8"><span className="text-4xl font-bold">{price}</span><span className="text-sm opacity-60">{period}</span></div>
        <ul className="space-y-4 mb-8 flex-1">{features.map((f: string, i: number) => (<li key={i} className="flex items-center gap-3 text-sm"><Check size={16} className={featured ? 'text-brand-400' : 'text-brand-600 dark:text-brand-400'} /><span className="opacity-80">{f}</span></li>))}</ul>
        <button className={`w-full py-3 rounded-xl font-bold transition-all ${featured ? 'bg-white text-black hover:bg-gray-100' : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'}`}>Choose {title}</button>
    </div>
);

const App = () => {
    const { initAuth } = useStore();
    useEffect(() => { initAuth(); }, []);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
        </Route>
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default App;