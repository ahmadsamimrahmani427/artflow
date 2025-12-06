export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'rect' | 'circle' | 'path';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  fill?: string;
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  visible?: boolean;
  locked?: boolean;

  // Rect specific
  cornerRadius?: number;

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string; // "normal", "bold", "italic", "italic bold"
  textDecoration?: string; // "underline", "line-through", ""
  align?: string; // "left", "center", "right", "justify"
  
  // Stroke / Outline
  stroke?: string;
  strokeWidth?: number;
  strokeLineCap?: 'butt' | 'round' | 'square';
  strokeLineJoin?: 'miter' | 'round' | 'bevel';
  
  // Shadow
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;

  // Image specific
  src?: string; 

  // Path specific
  data?: string; // SVG Path Data

  // Gradient specific
  fillPriority?: 'color' | 'linear-gradient';
  fillLinearGradientStartPointX?: number;
  fillLinearGradientStartPointY?: number;
  fillLinearGradientEndPointX?: number;
  fillLinearGradientEndPointY?: number;
  fillLinearGradientColorStops?: (number | string)[]; // [0, 'red', 1, 'blue']
}

export interface SafeArea {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    stroke?: string; // Color of guide
    fill?: string; // Optional background fill
}

export interface Template {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'Instagram' | 'YouTube' | 'Facebook' | 'Twitter' | 'Custom';
  safeAreas?: SafeArea[];
}

export interface TemplateDesign {
    id: string;
    name: string;
    category: 'YouTube' | 'Instagram' | 'Facebook' | 'Twitter' | 'Minimal' | 'Colorful' | 'Business';
    svgContent: string; // The raw SVG string
    preview: string; // URL or base64 for thumbnail (we'll generate from SVG or use a placeholder)
}

export interface StickerItem {
    id: string;
    name: string;
    category: 'Social' | 'Shapes' | 'Emoji' | 'Decorative' | 'Badge' | 'Custom';
    url: string; // base64 or URL
    type: 'svg' | 'image';
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    tier: 'free' | 'pro';
}

export interface Project {
    id: string;
    userId: string;
    name: string;
    thumbnail: string; // base64
    elements: CanvasElement[];
    config: Template;
    updatedAt: number;
    createdAt: number;
}

export const SOCIAL_TEMPLATES: Template[] = [
  { 
      id: 'yt-channel', 
      name: 'YouTube Channel Art', 
      width: 2560, 
      height: 1440, 
      category: 'YouTube',
      safeAreas: [
          // The "Text and Logo Safe Area" (1546x423) centered
          { id: 'safe-text', x: 507, y: 508, width: 1546, height: 423, label: 'Safe Area (All Devices)', stroke: '#10b981' },
          // Desktop Max width (2560x423)
          { id: 'desktop-max', x: 0, y: 508, width: 2560, height: 423, label: 'Desktop Max', stroke: '#3b82f6' }
      ]
  },
  { 
      id: 'yt-thumb', 
      name: 'YouTube Thumbnail', 
      width: 1280, 
      height: 720, 
      category: 'YouTube',
      safeAreas: [
           // Approximate Timestamp area (bottom right)
           { id: 'timestamp', x: 1050, y: 610, width: 210, height: 90, label: 'Avoid (Timestamp)', stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }
      ]
  },
  { 
      id: 'ig-sq', 
      name: 'Instagram Post', 
      width: 1080, 
      height: 1080, 
      category: 'Instagram',
      safeAreas: []
  },
  { 
      id: 'ig-port', 
      name: 'Instagram Portrait', 
      width: 1080, 
      height: 1350, 
      category: 'Instagram',
      safeAreas: [
          // The 1:1 square preview seen in grid
          { id: 'ig-feed-preview', x: 0, y: 135, width: 1080, height: 1080, label: 'Feed Preview (1:1)', stroke: '#3b82f6' }
      ]
  },
  { 
      id: 'ig-story', 
      name: 'Instagram Story', 
      width: 1080, 
      height: 1920, 
      category: 'Instagram',
      safeAreas: [
          { id: 'story-ui-top', x: 0, y: 0, width: 1080, height: 250, label: 'Avoid (Profile UI)', stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' },
          { id: 'story-ui-bottom', x: 0, y: 1670, width: 1080, height: 250, label: 'Avoid (Swipe UI)', stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }
      ]
  },
  { 
      id: 'fb-cover', 
      name: 'Facebook Cover', 
      width: 820, 
      height: 312, 
      category: 'Facebook',
      safeAreas: [
          // Mobile safe area (approx 640px wide centered)
          { id: 'fb-mobile', x: 90, y: 0, width: 640, height: 312, label: 'Mobile Safe Area', stroke: '#10b981' }
      ]
  },
  {
      id: 'twitter-header',
      name: 'Twitter Header',
      width: 1500,
      height: 500,
      category: 'Twitter',
      safeAreas: [
          { id: 'twitter-pfp', x: 50, y: 250, width: 200, height: 200, label: 'Profile Pic Area', stroke: '#ef4444' }
      ]
  }
];