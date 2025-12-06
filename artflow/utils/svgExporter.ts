import { CanvasElement, Template } from '../types';

export const exportToSVG = (elements: CanvasElement[], config: Template): string => {
    let svgContent = '';

    // Sort elements by z-index (same order as array)
    elements.forEach(el => {
        if (el.visible === false) return;

        // Common attributes
        const transform = `translate(${el.x} ${el.y}) rotate(${el.rotation || 0}) scale(${el.scaleX || 1} ${el.scaleY || 1})`;
        const opacity = el.opacity !== undefined ? el.opacity : 1;
        const stroke = el.stroke ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth || 0}"` : '';
        const fill = el.fill ? `fill="${el.fill}"` : 'fill="none"';
        
        // Shadow (Basic implementation via style filter, though SVG filters are better but more complex to inline here without defs management)
        // For simplicity in this exporter, we skip complex filters or assume browser support for style-based shadows if any.
        // Actually, inline styles are best for simple exports.
        
        const commonAttrs = `transform="${transform}" opacity="${opacity}" ${stroke}`;

        if (el.type === 'rect') {
            svgContent += `<rect width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" ${fill} ${commonAttrs} />\n`;
        } else if (el.type === 'circle') {
            // Konva uses width/height for bounding box of circle, so radius is width/2
            const r = (el.width || 0) / 2;
            svgContent += `<circle cx="${r}" cy="${r}" r="${r}" ${fill} ${commonAttrs} />\n`;
        } else if (el.type === 'text') {
            // Text handling is complex due to wrapping. We export basic text at anchor point.
            // SVG text alignment requires text-anchor
            let anchor = 'start';
            let xOff = 0;
            if (el.align === 'center') { anchor = 'middle'; xOff = (el.width || 0) / 2; }
            if (el.align === 'right') { anchor = 'end'; xOff = (el.width || 0); }
            
            const styles = `font-family: "${el.fontFamily || 'Inter'}", sans-serif; font-size: ${el.fontSize}px; font-weight: ${(el.fontStyle || '').includes('bold') ? 'bold' : 'normal'}; font-style: ${(el.fontStyle || '').includes('italic') ? 'italic' : 'normal'}; text-decoration: ${el.textDecoration};`;
            
            // Adjust Y for baseline roughly
            svgContent += `<text x="${xOff}" y="${(el.fontSize || 16) * 0.8}" text-anchor="${anchor}" style="${styles}" ${fill} ${commonAttrs}>${el.text}</text>\n`;
        } else if (el.type === 'image' && el.src) {
            svgContent += `<image href="${el.src}" width="${el.width}" height="${el.height}" ${commonAttrs} preserveAspectRatio="none" />\n`;
        } else if (el.type === 'path' && el.data) {
            svgContent += `<path d="${el.data}" ${fill} ${commonAttrs} />\n`;
        }
    });

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.width} ${config.height}" width="${config.width}" height="${config.height}">
  <!-- Background -->
  <rect width="100%" height="100%" fill="white" />
  ${svgContent}
</svg>
`.trim();
};