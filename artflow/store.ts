import { create } from 'zustand';
import { CanvasElement, Template, SOCIAL_TEMPLATES, StickerItem, User, Project } from './types';
import { v4 as uuidv4 } from 'uuid';
import { authApi, projectApi } from './services/api';

interface HistoryState {
  elements: CanvasElement[];
  selectedId: string | null;
}

interface AppState {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasConfig: Template;
  theme: 'dark' | 'light';
  language: 'en' | 'fa';
  showGuides: boolean;
  clipboard: CanvasElement | null;
  customAssets: StickerItem[];
  
  // User State
  user: User | null;
  userTier: 'free' | 'pro';
  
  // Project State
  projects: Project[];
  currentProjectId: string | null;
  isSaving: boolean;
  isLoadingProjects: boolean;

  // AI Preview State
  suggestionPreview: CanvasElement[] | null;

  // History
  past: HistoryState[];
  future: HistoryState[];

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  loadProjects: () => Promise<void>;
  saveProject: (name: string, thumbnail: string) => Promise<void>;
  loadProjectIntoCanvas: (id: string) => void;
  deleteProject: (id: string) => Promise<void>;

  addElement: (element: Partial<CanvasElement>) => void;
  addOrReplaceImage: (element: Partial<CanvasElement>, forceReplace?: boolean) => void; // Smart Action with Force option
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  moveElement: (id: string, toIndex: number) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setCanvasConfig: (config: Template) => void;
  setElements: (elements: CanvasElement[]) => void;
  clearCanvas: () => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  toggleGuides: () => void;
  copy: () => void;
  paste: () => void;
  addCustomAsset: (asset: StickerItem) => void;
  upgradePlan: () => void;
  
  // AI Actions
  setSuggestionPreview: (elements: CanvasElement[] | null) => void;
  applySuggestion: () => void;
  discardSuggestion: () => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  elements: [],
  selectedId: null,
  canvasConfig: SOCIAL_TEMPLATES[0],
  theme: 'dark',
  language: 'en',
  showGuides: true,
  clipboard: null,
  customAssets: [],
  user: null,
  userTier: 'pro', // Enforce PRO tier by default
  
  projects: [],
  currentProjectId: null,
  isSaving: false,
  isLoadingProjects: false,

  suggestionPreview: null,
  past: [],
  future: [],

  // --- Auth Actions ---
  initAuth: async () => {
      const user = await authApi.getSession();
      // Always enforce PRO tier
      if (user) set({ user, userTier: 'pro' });
  },

  login: async (email, pass) => {
      const user = await authApi.login(email, pass);
      set({ user, userTier: 'pro' });
      await get().loadProjects();
  },

  signup: async (email, pass, name) => {
      const user = await authApi.signup(email, pass, name);
      set({ user, userTier: 'pro' });
  },

  logout: async () => {
      await authApi.logout();
      set({ user: null, userTier: 'pro', projects: [], currentProjectId: null });
      get().clearCanvas();
  },

  // --- Project Actions ---
  loadProjects: async () => {
      set({ isLoadingProjects: true });
      try {
          const projects = await projectApi.getAll();
          set({ projects });
      } catch (e) {
          console.error(e);
      } finally {
          set({ isLoadingProjects: false });
      }
  },

  saveProject: async (name, thumbnail) => {
      set({ isSaving: true });
      try {
          const { elements, canvasConfig, currentProjectId } = get();
          
          const projectData = {
              id: currentProjectId || undefined,
              name,
              thumbnail,
              elements,
              config: canvasConfig
          };

          const saved = await projectApi.save(projectData as any);
          
          set(state => {
              // Update local list
              const existingIdx = state.projects.findIndex(p => p.id === saved.id);
              let newProjects = [...state.projects];
              if (existingIdx >= 0) {
                  newProjects[existingIdx] = saved;
              } else {
                  newProjects = [saved, ...state.projects];
              }
              return { 
                  projects: newProjects,
                  currentProjectId: saved.id,
                  isSaving: false
              };
          });
      } catch (e) {
          console.error(e);
          set({ isSaving: false });
          throw e;
      }
  },

  loadProjectIntoCanvas: (id) => {
      const project = get().projects.find(p => p.id === id);
      if (project) {
          get().clearCanvas(); // clear history too
          set({
              currentProjectId: project.id,
              elements: project.elements,
              canvasConfig: project.config
          });
      }
  },

  deleteProject: async (id) => {
      try {
          await projectApi.delete(id);
          set(state => ({
              projects: state.projects.filter(p => p.id !== id),
              currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
          }));
          if (get().currentProjectId === id) {
              get().clearCanvas();
          }
      } catch (e) {
          console.error(e);
      }
  },

  // --- Canvas Actions ---

  saveToHistory: () => {
      const { elements, selectedId, past } = get();
      const newPast = [...past, { elements: [...elements], selectedId }].slice(-50);
      set({ past: newPast, future: [] });
  },

  addElement: (element) => {
    get().saveToHistory();
    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: uuidv4(),
          x: 100,
          y: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          ...element,
        } as CanvasElement
      ]
    }));
  },

  addOrReplaceImage: (element, forceReplace = false) => {
    get().saveToHistory();
    const { elements, selectedId } = get();
    
    // Prepare updates from incoming element, stripping undefineds
    const { src, width, height, x, y, scaleX, scaleY, rotation } = element;
    const baseUpdates: any = { src };
    // Only apply dimensions if explicitly provided (avoids overwriting with undefined)
    if (width !== undefined) baseUpdates.width = width;
    if (height !== undefined) baseUpdates.height = height;
    if (x !== undefined) baseUpdates.x = x;
    if (y !== undefined) baseUpdates.y = y;
    if (scaleX !== undefined) baseUpdates.scaleX = scaleX;
    if (scaleY !== undefined) baseUpdates.scaleY = scaleY;
    if (rotation !== undefined) baseUpdates.rotation = rotation;

    // 1. If an image is explicitly selected and unlocked, replace it.
    const selected = elements.find(el => el.id === selectedId);
    if (selected && selected.type === 'image' && !selected.locked) {
        set(state => ({
            elements: state.elements.map(el => {
                if (el.id === selected.id) {
                    let finalUpdates = { ...baseUpdates };
                    
                    // If replacing an existing image with a new one (uploaded), 
                    // we want to maintain the visual bounding box of the old image
                    // but use the high-res dimensions of the new one.
                    if (element.width && element.height) {
                        const currentVisualWidth = (el.width || 100) * (el.scaleX || 1);
                        // Calculate scale to match previous visual width
                        const newScale = currentVisualWidth / element.width;
                        
                        finalUpdates = {
                            ...finalUpdates,
                            width: element.width,
                            height: element.height,
                            scaleX: newScale,
                            scaleY: newScale, // Maintain aspect ratio of new image
                        };
                    }
                    return { ...el, ...finalUpdates };
                }
                return el;
            })
        }));
        return;
    }
    
    // 2. Find all unlocked images in the scene
    const unlockedImages = elements.filter(el => el.type === 'image' && !el.locked);
    
    if (unlockedImages.length > 0) {
        // Sort by area to find the "main" image (largest)
        const sorted = [...unlockedImages].sort((a, b) => {
            const areaA = (a.width || 0) * (a.height || 0) * Math.abs(a.scaleX || 1) * Math.abs(a.scaleY || 1);
            const areaB = (b.width || 0) * (b.height || 0) * Math.abs(b.scaleX || 1) * Math.abs(b.scaleY || 1);
            return areaB - areaA;
        });

        const mainImage = sorted[0];

        // If forceReplace is ON (AI mode), we enforce strict "Single Image" policy 
        // by removing other unlocked images to prevent stacking.
        // If forceReplace is OFF (Upload), we just replace the main one but keep others (collages).
        const idsToRemove = forceReplace ? new Set(sorted.slice(1).map(el => el.id)) : new Set();
        
        set(state => ({
            elements: state.elements
                .filter(el => !idsToRemove.has(el.id))
                .map(el => {
                    if (el.id === mainImage.id) {
                         // Similar logic: if new image has dimensions, respect them but fit to canvas/old?
                         // If forceReplace is true (AI generation), we usually want to use the full canvas dimensions provided in `element`.
                         // `element` usually has width=canvasWidth, height=canvasHeight, x=0, y=0 for AI gen.
                         // So we just take baseUpdates as is.
                         
                         // If NOT forceReplace (e.g. upload button), we probably calculated `element` dimensions to center it.
                         // So we also want to use baseUpdates as is.
                         return { ...el, ...baseUpdates };
                    }
                    return el;
                })
        }));
        return;
    }
    
    // 3. Fallback: No suitable candidate to replace, add new image.
    const newId = uuidv4();
    set(state => ({
        elements: [
            ...state.elements,
            {
                x: 100, // Default pos
                y: 100,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                ...baseUpdates, // Spread passed properties (width, height, etc)
                id: newId,
                type: 'image'
            } as CanvasElement
        ]
    }));
  },

  updateElement: (id, updates) => {
      set((state) => ({
        elements: state.elements.map((el) => 
          el.id === id ? { ...el, ...updates } : el
        )
      }));
  },

  reorderElement: (id, direction) => {
    get().saveToHistory();
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id);
      if (index === -1) return state;

      const newElements = [...state.elements];
      const [movedElement] = newElements.splice(index, 1);

      if (direction === 'up') {
        if (index < state.elements.length - 1) {
          newElements.splice(index + 1, 0, movedElement);
        } else {
          newElements.push(movedElement);
        }
      } else if (direction === 'down') {
        if (index > 0) {
          newElements.splice(index - 1, 0, movedElement);
        } else {
          newElements.unshift(movedElement);
        }
      } else if (direction === 'top') {
        newElements.push(movedElement);
      } else if (direction === 'bottom') {
        newElements.unshift(movedElement);
      }

      return { elements: newElements };
    });
  },

  moveElement: (id, toIndex) => {
      get().saveToHistory();
      set((state) => {
          const fromIndex = state.elements.findIndex((el) => el.id === id);
          if (fromIndex === -1) return state;
          
          const newElements = [...state.elements];
          const [moved] = newElements.splice(fromIndex, 1);
          newElements.splice(toIndex, 0, moved);
          
          return { elements: newElements };
      });
  },

  removeElement: (id) => {
    get().saveToHistory();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    }));
  },

  selectElement: (id) => set({ selectedId: id }),

  setCanvasConfig: (config) => {
      get().saveToHistory();
      set({ canvasConfig: config });
  },

  setElements: (elements) => {
      get().saveToHistory();
      set({ elements });
  },

  clearCanvas: () => {
      get().saveToHistory();
      set({ elements: [], selectedId: null, currentProjectId: null });
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    return { theme: newTheme };
  }),

  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'fa' : 'en' })),

  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  copy: () => {
      const { elements, selectedId } = get();
      if (!selectedId) return;
      const el = elements.find(e => e.id === selectedId);
      if (el) {
          set({ clipboard: JSON.parse(JSON.stringify(el)) });
      }
  },

  paste: () => {
      const { clipboard } = get();
      if (!clipboard) return;
      
      get().saveToHistory();
      
      const newId = uuidv4();
      const newEl = {
          ...clipboard,
          id: newId,
          x: clipboard.x + 20,
          y: clipboard.y + 20
      };
      
      set(state => ({
          elements: [...state.elements, newEl],
          selectedId: newId
      }));
  },
  
  addCustomAsset: (asset) => set(state => ({ customAssets: [...state.customAssets, asset] })),
  
  upgradePlan: () => set(state => {
      return { userTier: 'pro' };
  }),

  setSuggestionPreview: (elements) => set({ suggestionPreview: elements }),
  
  applySuggestion: () => {
      const { suggestionPreview } = get();
      if (suggestionPreview) {
          get().saveToHistory();
          set({ elements: suggestionPreview, suggestionPreview: null });
      }
  },
  
  discardSuggestion: () => set({ suggestionPreview: null }),

  undo: () => set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      
      return {
          past: newPast,
          future: [{ elements: state.elements, selectedId: state.selectedId }, ...state.future],
          elements: previous.elements,
          selectedId: previous.selectedId
      };
  }),

  redo: () => set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      
      return {
          past: [...state.past, { elements: state.elements, selectedId: state.selectedId }],
          future: newFuture,
          elements: next.elements,
          selectedId: next.selectedId
      };
  }),
}));