import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Palette, Menu, X, Sun, Moon, Github, Twitter, Linkedin, LayoutTemplate, FolderOpen, CreditCard, LogOut, User as UserIcon, Globe } from 'lucide-react';
import { useStore } from '../store';
import { AuthModal } from './AuthModal';

export const Layout = () => {
  const { theme, toggleTheme, user, logout, language, toggleLanguage } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
  const location = useLocation();

  const navLinks = [
    { name: 'Templates', path: '/templates', icon: <LayoutTemplate size={18} /> },
    { name: 'Projects', path: '/projects', icon: <FolderOpen size={18} /> },
    { name: 'Pricing', path: '/pricing', icon: <CreditCard size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const openAuth = (tab: 'login' | 'signup') => {
      setAuthTab(tab);
      setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300" dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                <Palette size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">ArtFlow</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            
            {user ? (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
                    </div>
                    <button 
                        onClick={logout} 
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors" 
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                    <Link
                        to="/editor"
                        className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
                    >
                        Editor
                    </Link>
                </div>
            ) : (
                <>
                    <button onClick={() => openAuth('login')} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:text-brand-500 transition-colors">
                        Log in
                    </button>
                    <button
                        onClick={() => openAuth('signup')}
                        className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-brand-500/20"
                    >
                        Sign Up
                    </button>
                </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-3/4 max-w-sm bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-slate-900 dark:text-white">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            {user && (
                 <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                 </div>
            )}
            
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-4 rounded-xl text-lg font-medium flex items-center gap-3 ${
                    isActive(link.path)
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <hr className="my-4 border-slate-200 dark:border-white/10" />
              
              {user ? (
                   <button
                    onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                    }}
                    className="p-4 rounded-xl text-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 w-full text-left"
                  >
                    <LogOut size={20} /> Sign Out
                  </button>
              ) : (
                  <>
                    <button
                        onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }}
                        className="p-4 rounded-xl text-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-3 w-full text-left"
                    >
                        Log In
                    </button>
                     <button
                        onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }}
                        className="p-4 rounded-xl text-lg font-bold bg-brand-600 text-white text-center mt-2 shadow-lg shadow-brand-500/30"
                    >
                        Sign Up Free
                    </button>
                  </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center">
                        <Palette size={12} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">ArtFlow</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    AI-powered design for everyone. Create beautiful banners in seconds.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Twitter size={20} /></a>
                    <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Github size={20} /></a>
                    <a href="#" className="text-slate-400 hover:text-brand-500 transition-colors"><Linkedin size={20} /></a>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li><Link to="/templates" className="hover:text-brand-500">Templates</Link></li>
                    <li><Link to="/pricing" className="hover:text-brand-500">Pricing</Link></li>
                    <li><Link to="/editor" className="hover:text-brand-500">Editor</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <li><a href="#" className="hover:text-brand-500">About</a></li>
                    <li><a href="#" className="hover:text-brand-500">Blog</a></li>
                    <li><a href="#" className="hover:text-brand-500">Careers</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Settings</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                     <li>
                        <button onClick={toggleLanguage} className="hover:text-brand-500 flex items-center gap-2">
                             <Globe size={14} /> {language === 'en' ? 'English (US)' : 'Persian (فارسی)'}
                        </button>
                    </li>
                    <li><a href="#" className="hover:text-brand-500">Privacy</a></li>
                    <li><a href="#" className="hover:text-brand-500">Terms</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-400">
            © 2025 ArtFlow Inc. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal Global Access */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialTab={authTab} />
    </div>
  );
};