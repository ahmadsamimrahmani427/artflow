import { TemplateDesign } from '../types';

export const TEMPLATES_DATA: TemplateDesign[] = [
    {
        id: 'tmpl-001',
        name: 'Neon Gaming',
        category: 'YouTube',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1280 720">
            <rect x="0" y="0" width="1280" height="720" fill="#111827" />
            <circle cx="200" cy="200" r="300" fill="#7c3aed" opacity="0.3" />
            <circle cx="1080" cy="520" r="250" fill="#db2777" opacity="0.3" />
            <rect x="80" y="80" width="1120" height="560" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.1" />
            <text x="640" y="320" font-family="Inter" font-weight="bold" font-size="80" fill="#ffffff" text-anchor="middle">EPIC GAMING</text>
            <text x="640" y="420" font-family="Inter" font-size="40" fill="#a78bfa" text-anchor="middle">LIVE STREAM HIGHLIGHTS</text>
            <rect x="540" y="500" width="200" height="60" fill="#db2777" />
            <text x="640" y="542" font-family="Inter" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">WATCH NOW</text>
        </svg>
        `
    },
    {
        id: 'tmpl-002',
        name: 'Minimal Quote',
        category: 'Instagram',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1080 1080">
            <rect x="0" y="0" width="1080" height="1080" fill="#f9fafb" />
            <text x="540" y="300" font-family="Times New Roman" font-size="200" fill="#e5e7eb" text-anchor="middle">“</text>
            <text x="540" y="500" font-family="Inter" font-weight="bold" font-size="60" fill="#1f2937" text-anchor="middle">Design is intelligence</text>
            <text x="540" y="580" font-family="Inter" font-weight="bold" font-size="60" fill="#1f2937" text-anchor="middle">made visible.</text>
            <rect x="490" y="650" width="100" height="4" fill="#0ea5e9" />
            <text x="540" y="800" font-family="Inter" font-size="30" fill="#6b7280" text-anchor="middle">@ARTFLOW_STUDIO</text>
        </svg>
        `
    },
    {
        id: 'tmpl-003',
        name: 'Summer Sale',
        category: 'Business',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1080 1350">
            <rect x="0" y="0" width="1080" height="1350" fill="#fef2f2" />
            <circle cx="540" cy="500" r="400" fill="#fee2e2" />
            <rect x="140" y="140" width="800" height="800" fill="#ef4444" opacity="0.1" />
            <text x="540" y="400" font-family="Inter" font-weight="bold" font-size="120" fill="#ef4444" text-anchor="middle">SUMMER</text>
            <text x="540" y="520" font-family="Inter" font-weight="bold" font-size="120" fill="#ef4444" text-anchor="middle">SALE</text>
            <text x="540" y="700" font-family="Inter" font-weight="bold" font-size="200" fill="#1f2937" text-anchor="middle">50%</text>
            <text x="540" y="850" font-family="Inter" font-size="40" fill="#374151" text-anchor="middle">OFF EVERYTHING</text>
            <rect x="340" y="1000" width="400" height="80" fill="#1f2937" />
            <text x="540" y="1055" font-family="Inter" font-weight="bold" font-size="32" fill="#ffffff" text-anchor="middle">SHOP NOW</text>
        </svg>
        `
    },
    {
        id: 'tmpl-004',
        name: 'Tech Review',
        category: 'YouTube',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1280 720">
            <rect x="0" y="0" width="1280" height="720" fill="#000000" />
            <rect x="640" y="0" width="640" height="720" fill="#1f2937" />
            <text x="100" y="150" font-family="Inter" font-weight="bold" font-size="40" fill="#3b82f6">REVIEW</text>
            <text x="100" y="300" font-family="Inter" font-weight="bold" font-size="90" fill="#ffffff">THE NEW</text>
            <text x="100" y="400" font-family="Inter" font-weight="bold" font-size="90" fill="#ffffff">FLAGSHIP</text>
            <rect x="100" y="460" width="300" height="10" fill="#3b82f6" />
            <text x="100" y="600" font-family="Inter" font-size="30" fill="#9ca3af">Is it worth the upgrade?</text>
        </svg>
        `
    },
    {
        id: 'tmpl-005',
        name: 'Podcast Cover',
        category: 'Colorful',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1080 1080">
            <rect x="0" y="0" width="1080" height="1080" fill="#4f46e5" />
            <circle cx="0" cy="1080" r="800" fill="#818cf8" opacity="0.5" />
            <circle cx="1080" cy="0" r="600" fill="#c7d2fe" opacity="0.3" />
            <rect x="140" y="140" width="800" height="800" fill="none" stroke="#ffffff" stroke-width="10" />
            <text x="540" y="400" font-family="Inter" font-weight="bold" font-size="80" fill="#ffffff" text-anchor="middle">THE DAILY</text>
            <text x="540" y="550" font-family="Inter" font-weight="bold" font-size="140" fill="#ffffff" text-anchor="middle">CREATIVE</text>
            <text x="540" y="750" font-family="Inter" font-size="40" fill="#e0e7ff" text-anchor="middle">EPISODE 42 • HOSTED BY ALEX</text>
        </svg>
        `
    },
    {
        id: 'tmpl-006',
        name: 'Organic Nature',
        category: 'Minimal',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1080 1350">
            <rect x="0" y="0" width="1080" height="1350" fill="#ecfdf5" />
            <circle cx="900" cy="200" r="300" fill="#d1fae5" />
            <circle cx="100" cy="1200" r="400" fill="#d1fae5" />
            <text x="540" y="600" font-family="Inter" font-weight="bold" font-size="100" fill="#065f46" text-anchor="middle">Mindful</text>
            <text x="540" y="720" font-family="Inter" font-weight="bold" font-size="100" fill="#065f46" text-anchor="middle">Living</text>
            <rect x="440" y="800" width="200" height="2" fill="#059669" />
            <text x="540" y="900" font-family="Inter" font-size="36" fill="#047857" text-anchor="middle">A guide to finding balance</text>
        </svg>
        `
    },
    {
        id: 'tmpl-007',
        name: 'Cyberpunk Stream',
        category: 'YouTube',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1920 1080">
            <rect x="0" y="0" width="1920" height="1080" fill="#09090b" />
            <rect x="0" y="500" width="1920" height="80" fill="#facc15" transform="rotate(-5 960 540)" />
            <rect x="0" y="500" width="1920" height="80" fill="#0ea5e9" transform="rotate(5 960 540)" opacity="0.8" />
            <text x="960" y="560" font-family="Inter" font-weight="bold" font-size="150" fill="#ffffff" text-anchor="middle" stroke="#000000" stroke-width="4">STARTING SOON</text>
            <text x="960" y="800" font-family="Inter" font-weight="bold" font-size="40" fill="#facc15" text-anchor="middle">DONT FORGET TO SUBSCRIBE</text>
        </svg>
        `
    },
    {
        id: 'tmpl-008',
        name: 'Event Invite',
        category: 'Facebook',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 820 312">
            <rect x="0" y="0" width="820" height="312" fill="#fff1f2" />
            <rect x="0" y="0" width="300" height="312" fill="#fda4af" />
            <text x="150" y="140" font-family="Inter" font-weight="bold" font-size="80" fill="#881337" text-anchor="middle">24</text>
            <text x="150" y="190" font-family="Inter" font-size="30" fill="#881337" text-anchor="middle">DECEMBER</text>
            <text x="350" y="100" font-family="Inter" font-weight="bold" font-size="40" fill="#be123c">HOLIDAY</text>
            <text x="350" y="150" font-family="Inter" font-weight="bold" font-size="40" fill="#be123c">PARTY</text>
            <text x="350" y="200" font-family="Inter" font-size="16" fill="#881337">JOIN US FOR A NIGHT OF FUN</text>
            <rect x="650" y="100" width="120" height="40" fill="#be123c" rx="20" />
            <text x="710" y="125" font-family="Inter" font-size="14" fill="#ffffff" text-anchor="middle">RSVP</text>
        </svg>
        `
    },
    {
        id: 'tmpl-009',
        name: 'Hiring Post',
        category: 'Business',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1080 1080">
            <rect x="0" y="0" width="1080" height="1080" fill="#1e3a8a" />
            <rect x="100" y="100" width="880" height="880" fill="none" stroke="#60a5fa" stroke-width="4" />
            <text x="540" y="400" font-family="Inter" font-weight="bold" font-size="120" fill="#ffffff" text-anchor="middle">WE ARE</text>
            <text x="540" y="550" font-family="Inter" font-weight="bold" font-size="180" fill="#93c5fd" text-anchor="middle">HIRING</text>
            <text x="540" y="750" font-family="Inter" font-size="40" fill="#bfdbfe" text-anchor="middle">SENIOR DESIGNER & DEVELOPER</text>
            <rect x="340" y="850" width="400" height="80" fill="#ffffff" rx="40" />
            <text x="540" y="905" font-family="Inter" font-weight="bold" font-size="32" fill="#1e3a8a" text-anchor="middle">APPLY NOW</text>
        </svg>
        `
    },
    {
        id: 'tmpl-010',
        name: 'Breaking News',
        category: 'Twitter',
        preview: '',
        svgContent: `
        <svg viewBox="0 0 1500 500">
            <rect x="0" y="0" width="1500" height="500" fill="#dc2626" />
            <rect x="0" y="400" width="1500" height="100" fill="#991b1b" />
            <text x="750" y="250" font-family="Inter" font-weight="bold" font-size="120" fill="#ffffff" text-anchor="middle" font-style="italic">BREAKING NEWS</text>
            <text x="750" y="465" font-family="Inter" font-weight="bold" font-size="40" fill="#fecaca" text-anchor="middle">LIVE UPDATES ON OUR WEBSITE</text>
            <circle cx="200" cy="250" r="50" fill="#ffffff" opacity="0.2" />
             <circle cx="1300" cy="250" r="50" fill="#ffffff" opacity="0.2" />
        </svg>
        `
    }
];