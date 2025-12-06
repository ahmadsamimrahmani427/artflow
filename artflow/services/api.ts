import { User, Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

// --- MOCK DATABASE ---
const STORAGE_KEYS = {
    USERS: 'artflow_users',
    SESSION: 'artflow_session',
};

// --- API DELAY SIMULATION ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API ERROR CLASS ---
class ApiError extends Error {
    constructor(public message: string, public status: number) {
        super(message);
    }
}

// --- INDEXEDDB HELPERS ---
const DB_NAME = 'ArtFlowDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
            }
        };
    });
};

const dbAction = <T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> => {
    return openDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_PROJECTS, mode);
            const store = tx.objectStore(STORE_PROJECTS);
            
            let request: IDBRequest<T> | void;
            try {
                request = callback(store);
            } catch (e) {
                reject(e);
                return;
            }

            if (request) {
                request.onsuccess = () => resolve(request!.result);
                request.onerror = () => reject(request!.error);
            } else {
                tx.oncomplete = () => resolve(undefined as T);
                tx.onerror = () => reject(tx.error);
            }
        });
    });
};

// --- AUTH SERVICE (LocalStorage is fine for small user data) ---

export const authApi = {
    login: async (email: string, password: string): Promise<User> => {
        await delay(800); // Simulate network
        const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new ApiError('Invalid credentials', 401);
        }

        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
        return user;
    },

    signup: async (email: string, password: string, name: string): Promise<User> => {
        await delay(1000);
        const usersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: User[] = usersRaw ? JSON.parse(usersRaw) : [];

        if (users.find(u => u.email === email)) {
            throw new ApiError('User already exists', 409);
        }

        const newUser: User = {
            id: uuidv4(),
            email,
            name,
            tier: 'free',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
        return newUser;
    },

    logout: async () => {
        await delay(300);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    getSession: async (): Promise<User | null> => {
        const session = localStorage.getItem(STORAGE_KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    }
};

// --- PROJECT SERVICE (Uses IndexedDB for large data) ---

export const projectApi = {
    getAll: async (): Promise<Project[]> => {
        await delay(600);
        const session = await authApi.getSession();
        if (!session) throw new ApiError('Unauthorized', 401);

        try {
            const allProjects = await dbAction<Project[]>('readonly', (store) => store.getAll());
            // Filter locally (in real app, use an index)
            return allProjects
                .filter(p => p.userId === session.id)
                .sort((a, b) => b.updatedAt - a.updatedAt);
        } catch (error) {
            console.error("Failed to load projects", error);
            return [];
        }
    },

    save: async (project: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | Project): Promise<Project> => {
        await delay(800);
        const session = await authApi.getSession();
        if (!session) throw new ApiError('Unauthorized', 401);

        const now = Date.now();
        let savedProject: Project;

        // Check if updating existing
        if ('id' in project && project.id) {
            // Get existing to verify ownership
            const existing = await dbAction<Project>('readonly', (store) => store.get(project.id));
            
            if (existing) {
                if (existing.userId !== session.id) throw new ApiError('Forbidden', 403);
                
                savedProject = {
                    ...existing,
                    ...project,
                    userId: session.id, // Ensure ownership
                    updatedAt: now
                };
            } else {
                // ID provided but not found? Treat as new or error? Treat as new recovery.
                savedProject = {
                    ...(project as Project),
                    id: uuidv4(),
                    userId: session.id,
                    createdAt: now,
                    updatedAt: now
                };
            }
        } else {
            // Create new
            savedProject = {
                ...(project as Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>),
                id: uuidv4(),
                userId: session.id,
                createdAt: now,
                updatedAt: now
            };
        }

        await dbAction('readwrite', (store) => store.put(savedProject));
        return savedProject;
    },

    delete: async (id: string): Promise<void> => {
        await delay(500);
        const session = await authApi.getSession();
        if (!session) throw new ApiError('Unauthorized', 401);

        const project = await dbAction<Project>('readonly', (store) => store.get(id));
        
        if (project) {
            if (project.userId !== session.id) throw new ApiError('Forbidden', 403);
            await dbAction('readwrite', (store) => store.delete(id));
        }
    }
};