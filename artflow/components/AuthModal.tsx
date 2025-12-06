import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Github, Linkedin, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const { login, signup } = useStore();

    useEffect(() => {
        if (isOpen) {
            setMode(initialTab);
            setError('');
            setSuccessMsg('');
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login(email, password);
                onClose();
            } else if (mode === 'signup') {
                await signup(email, password, name);
                onClose();
            } else if (mode === 'forgot') {
                // Mock password reset
                await new Promise(resolve => setTimeout(resolve, 1500));
                setSuccessMsg(`Reset link sent to ${email}`);
                // Don't close immediately so they can read the message
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setIsLoading(true);
        // Simulate social login network delay
        setTimeout(async () => {
            try {
                // In a real app, this would redirect to OAuth
                // For demo, we just log in a mock user
                await login(`${provider.toLowerCase()}@example.com`, 'password');
                setIsLoading(false);
                onClose();
            } catch (e) {
                // If login fails (e.g. user doesn't exist), we might sign them up automatically
                // But for this mock, let's just show an error if login fails
                setError(`Could not connect to ${provider}`);
                setIsLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl relative animate-slide-up overflow-hidden border border-slate-200 dark:border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {mode === 'login' ? 'Enter your details to access your projects' : 
                             mode === 'signup' ? 'Join thousands of creators using ArtFlow' :
                             'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                required
                            />
                        </div>

                        {mode !== 'forgot' && (
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="password" 
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                                    required
                                />
                            </div>
                        )}
                        
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                                    className="text-xs text-brand-600 font-medium hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-lg">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                        
                        {successMsg && (
                            <div className="flex items-center gap-2 text-green-500 text-xs bg-green-500/10 p-3 rounded-lg">
                                <CheckCircle2 size={14} />
                                {successMsg}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
                        </button>
                    </form>

                    {mode !== 'forgot' && (
                        <>
                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                                <span className="text-xs text-slate-400">Or continue with</span>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => handleSocialLogin('Github')} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                                     <Github size={20} />
                                </button>
                                <button onClick={() => handleSocialLogin('LinkedIn')} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300">
                                     <Linkedin size={20} />
                                </button>
                            </div>
                        </>
                    )}

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {mode === 'login' ? "Don't have an account? " : mode === 'signup' ? "Already have an account? " : "Remember your password? "}
                        <button 
                            onClick={() => {
                                setMode(mode === 'signup' ? 'login' : 'signup'); // Default toggle logic
                                if (mode === 'forgot') setMode('login'); // Explicit return from forgot
                                setError('');
                                setSuccessMsg('');
                            }}
                            className="text-brand-600 font-bold hover:underline"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};