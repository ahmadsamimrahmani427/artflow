import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useStore } from '../store';

interface SaveProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    stageRef: React.RefObject<any>;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose, stageRef }) => {
    const { saveProject, currentProjectId, projects } = useStore();
    
    // Find existing name if editing
    const existingName = projects.find(p => p.id === currentProjectId)?.name || '';
    
    const [name, setName] = useState(existingName);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Generate Thumbnail
            let thumbnail = '';
            if (stageRef.current) {
                // Calculate pixelRatio to achieve a fixed width thumbnail (e.g., 320px)
                // This prevents huge thumbnails on large screens/canvases
                const stage = stageRef.current;
                const width = stage.width();
                const targetWidth = 320;
                const ratio = targetWidth / width;

                thumbnail = stage.toDataURL({ 
                    pixelRatio: ratio, 
                    mimeType: 'image/jpeg', 
                    quality: 0.6 
                });
            }

            await saveProject(name, thumbnail);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Failed to save project. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl relative animate-slide-up border border-slate-200 dark:border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Save Project</h3>
                    
                    <form onSubmit={handleSave}>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Project Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Design"
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white mb-6"
                            autoFocus
                            required
                        />
                        
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading || !name.trim()}
                                className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};