import { StickerItem } from '../types';

export const STICKERS_DATA: StickerItem[] = [
    // Social Media
    {
        id: 'stk-social-1',
        name: 'Like Button',
        category: 'Social',
        type: 'svg',
        url: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" r="256" fill="#ef4444"/><path d="M364.6 189.6c-4.4-11.4-16.1-18-28.7-18H264v-38c0-26.6-18.4-44.5-38.4-49.4-7.4-1.8-15.3 1.2-19.1 7.8l-72 124H96c-17.7 0-32 14.3-32 32v160c0 17.7 14.3 32 32 32h206.6c19.6 0 37.1-12.8 42.6-31.7l34.1-128c8.3-29.3-5-60.5-24.7-88.7z" fill="white"/></svg>`
    },
    {
        id: 'stk-social-2',
        name: 'Verified',
        category: 'Social',
        type: 'svg',
        url: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm-42.7 394.7L64 245.3l30.2-30.2 119.1 119.1 236.4-236.4 30.2 30.2-266.6 266.7z" fill="#3b82f6"/></svg>`
    },
    {
        id: 'stk-social-3',
        name: 'Share',
        category: 'Social',
        type: 'svg',
        url: `<svg viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`
    },
    
    // Shapes
    {
        id: 'stk-shape-1',
        name: 'Blob 1',
        category: 'Shapes',
        type: 'svg',
        url: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#FF0066" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.2C93.4,8.9,81.8,22.1,70.8,33.4C59.8,44.7,49.4,54.1,37.8,61.8C26.2,69.5,13.4,75.5,-0.6,76.5C-14.6,77.5,-27.9,73.5,-40.4,66.3C-52.9,59.1,-64.6,48.7,-73.4,36.1C-82.2,23.5,-88.1,8.7,-86.6,-5.5C-85.1,-19.7,-76.2,-33.3,-65.1,-44.6C-54,-55.9,-40.7,-64.9,-27.4,-72.6C-14.1,-80.3,-0.8,-86.7,13.1,-88.3C27,-89.9,40,-86.7,44.7,-76.4Z" transform="translate(100 100)" /></svg>`
    },
    {
        id: 'stk-shape-2',
        name: 'Star Burst',
        category: 'Shapes',
        type: 'svg',
        url: `<svg viewBox="0 0 24 24" fill="#Facc15" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
    },
    
    // Emojis
    {
        id: 'stk-emoji-1',
        name: 'Fire',
        category: 'Emoji',
        type: 'svg',
        url: `<svg viewBox="0 0 24 24" fill="#f97316" stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5.5 5.5 0 11-11 0c0-3.044 2.208-5.618 5.143-6.287.172.932.357 1.62.357 2.287 0 1.38-.5 2-1 3z"/></svg>`
    },
    {
        id: 'stk-emoji-2',
        name: 'Heart',
        category: 'Emoji',
        type: 'svg',
        url: `<svg viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    },
    
    // Decorative
    {
        id: 'stk-deco-1',
        name: 'Sparkles',
        category: 'Decorative',
        type: 'svg',
        url: `<svg viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M12 2l2.4 7.2h7.2l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.2z"/></svg>`
    },
    {
        id: 'stk-deco-2',
        name: 'Tape',
        category: 'Decorative',
        type: 'svg',
        url: `<svg viewBox="0 0 200 60"><rect x="0" y="0" width="200" height="60" fill="#fef08a" opacity="0.8" transform="rotate(-2 100 30)"/><path d="M0,0 L10,10 L0,20 L10,30 L0,40 L10,50 L0,60" fill="#fef08a" opacity="0.8" transform="translate(-5,0) rotate(-2 100 30)"/><path d="M200,0 L190,10 L200,20 L190,30 L200,40 L190,50 L200,60" fill="#fef08a" opacity="0.8" transform="translate(5,0) rotate(-2 100 30)"/></svg>`
    },
    
    // Badges
    {
        id: 'stk-badge-1',
        name: 'New',
        category: 'Badge',
        type: 'svg',
        url: `<svg viewBox="0 0 100 50"><rect width="100" height="50" rx="10" fill="#ef4444"/><text x="50" y="32" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle" fill="white">NEW</text></svg>`
    },
    {
        id: 'stk-badge-2',
        name: 'Sale',
        category: 'Badge',
        type: 'svg',
        url: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#facc15" stroke="#ca8a04" stroke-width="2"/><text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle" fill="#854d0e">SALE</text></svg>`
    }
];