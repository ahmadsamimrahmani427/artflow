import React, { useRef } from 'react';
import { Type, Image as ImageIcon, Square, Upload, LayoutTemplate, MousePointer2, Sticker } from 'lucide-react';
import { useStore } from '../store';
import { SOCIAL_TEMPLATES } from '../types';

interface ToolsPanelProps {
    activePanel: string | null;
    setActivePanel: (panel: string | null) => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ activePanel, setActivePanel }) => {
  const { addElement, addOrReplaceImage, setCanvasConfig, canvasConfig } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imgObj = new Image();
        imgObj.src = reader.result as string;
        imgObj.onload = () => {
             // Calculate scale to fit safe area (80% of canvas)
             const safeWidth = canvasConfig.width * 0.8;
             const safeHeight = canvasConfig.height * 0.8;
             const scale = Math.min(
                 safeWidth / imgObj.width,
                 safeHeight / imgObj.height,
                 1
             );

             // Use smart replacement to avoid stacking background images if user is uploading a new BG
             addOrReplaceImage({
                 type: 'image',
                 src: reader.result as string,
                 width: imgObj.width,
                 height: imgObj.height,
                 x: (canvasConfig.width - imgObj.width * scale) / 2,
                 y: (canvasConfig.height - imgObj.height * scale) / 2,
                 scaleX: scale,
                 scaleY: scale,
                 rotation: 0
             });
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTemplate = () => {
      // Logic handled in parent via setActivePanel potentially, or just direct action
      // For templates, we use a full modal usually, but for consistency let's use the prop if needed
      const random = SOCIAL_TEMPLATES[Math.floor(Math.random() * SOCIAL_TEMPLATES.length)];
      setCanvasConfig(random);
  };

  return (
    <div className="w-16 md:w-20 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-white/10 flex flex-col items-center py-6 gap-6 z-20 h-full overflow-y-auto overflow-x-hidden shadow-xl transition-colors duration-300 relative">
        {/* Main Tools */}
        <div className="flex flex-col gap-4 w-full px-2">
            <ToolButton 
                icon={<MousePointer2 size={22} />} 
                label="Select" 
                onClick={() => setActivePanel(null)} 
                active={activePanel === null}
            />
            
            {/* Stickers Toggle */}
            <ToolButton 
                icon={<Sticker size={22} />} 
                label="Stickers" 
                onClick={() => setActivePanel(activePanel === 'stickers' ? null : 'stickers')} 
                active={activePanel === 'stickers'}
            />

            <ToolButton 
                icon={<Type size={22} />} 
                label="Text" 
                onClick={() => addElement({
                    type: 'text',
                    text: 'Double click to edit',
                    fontSize: 60,
                    fill: '#000000',
                    fontFamily: 'Inter',
                    fontStyle: 'bold',
                    align: 'center',
                    width: 400,
                    x: (canvasConfig.width - 400) / 2,
                    y: canvasConfig.height / 2 - 30,
                })} 
            />

             <div className="relative w-full">
                <ToolButton 
                    icon={<Upload size={22} />} 
                    label="Upload" 
                    onClick={() => fileInputRef.current?.click()} 
                />
                <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                />
            </div>
            <ToolButton 
                icon={<Square size={22} />} 
                label="Shape" 
                onClick={() => addElement({
                    type: 'rect',
                    width: 200,
                    height: 200,
                    fill: '#3b82f6'
                })} 
            />
             <ToolButton 
                icon={<LayoutTemplate size={22} />} 
                label="Rand. Tmpl" 
                onClick={handleAddTemplate} 
            />
        </div>
    </div>
  );
};

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, onClick, active }) => (
  <button 
    onClick={onClick}
    className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all w-full ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}`}
  >
    <div className="mb-1 transition-transform group-hover:scale-110">{icon}</div>
    <span className="text-[10px] font-medium opacity-80">{label}</span>
  </button>
);