import React from 'react';
import { Check, Star, X, Zap } from 'lucide-react';
import { useStore } from '../store';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    const { upgradePlan } = useStore();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        upgradePlan(); // Mock API call
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl relative animate-slide-up overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col md:flex-row">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-black/10 dark:hover:bg-white/20 transition-colors z-10">
                    <X size={20} />
                </button>

                {/* Left Side: Visuals */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-brand-600 to-purple-700 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div>
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                            <Star size={24} className="text-yellow-300" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Unlock Pro</h2>
                        <p className="text-brand-100 text-sm leading-relaxed">Take your designs to the next level with professional tools and high-quality exports.</p>
                    </div>
                    <div className="mt-8 text-xs font-medium opacity-80">
                        Trusted by 10,000+ creators
                    </div>
                </div>

                {/* Right Side: Features & CTA */}
                <div className="w-full md:w-3/5 p-8 bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Why upgrade?</h3>
                    
                    <ul className="space-y-4 mb-8">
                        <FeatureRow text="Remove Watermarks" />
                        <FeatureRow text="3x High-Res Export (4K)" />
                        <FeatureRow text="Transparent Backgrounds" />
                        <FeatureRow text="Export as SVG Vector" />
                        <FeatureRow text="Premium Templates & Assets" />
                    </ul>

                    <div className="space-y-3">
                        <button 
                            onClick={handleUpgrade}
                            className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-500 shadow-xl shadow-brand-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Zap size={20} fill="currentColor" /> Upgrade for $12/mo
                        </button>
                        <p className="text-center text-xs text-slate-400">
                            7-day money-back guarantee. Cancel anytime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ text }: { text: string }) => (
    <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
            <Check size={12} className="text-green-600 dark:text-green-400" strokeWidth={3} />
        </div>
        <span className="text-sm font-medium">{text}</span>
    </li>
);