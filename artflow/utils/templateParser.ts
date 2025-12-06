import { v4 as uuidv4 } from 'uuid';
import { CanvasElement } from '../types';

/**
 * Parsed Gradient Definition
 */
interface GradientDef {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stops: (string | number)[];
}

/**
 * Parsed Shadow (Filter) Definition
 */
interface ShadowDef {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
}

/**
 * Transform state to carry down the recursion tree
 */
interface TransformState {
    translateX: number;
    translateY: number;
    rotate: number; // degrees
    scaleX: number;
    scaleY: number;
    opacity: number;
}

/**
 * Parses an SVG string into an array of CanvasElements.
 * Scales content to fit into targetWidth/targetHeight while maintaining aspect ratio (contain).
 */
export const parseTemplate = (svgString: string, targetWidth: number, targetHeight: number): CanvasElement[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');

    if (!svg) {
        console.error("Template parse error: No SVG tag found");
        return [];
    }

    // 1. Determine Original Size & Calculate Global Scale
    const viewBoxAttr = svg.getAttribute('viewBox');
    let origX = 0, origY = 0, origW = 100, origH = 100;

    if (viewBoxAttr) {
        const parts = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4) {
            [origX, origY, origW, origH] = parts;
        }
    } else {
        origW = parseFloat(svg.getAttribute('width') || '1080');
        origH = parseFloat(svg.getAttribute('height') || '1080');
    }

    // "Contain" logic: Fit the template inside the target canvas
    const scale = Math.min(targetWidth / origW, targetHeight / origH);
    const offsetX = (targetWidth - origW * scale) / 2 - (origX * scale);
    const offsetY = (targetHeight - origH * scale) / 2 - (origY * scale);

    const elements: CanvasElement[] = [];
    const gradients: Record<string, GradientDef> = {};
    const shadows: Record<string, ShadowDef> = {};

    // 2. Parse Definitions (Gradients & Filters)
    const defs = svg.querySelector('defs');
    if (defs) {
        // Gradients
        const linearGradients = defs.querySelectorAll('linearGradient');
        linearGradients.forEach(lg => {
            const id = lg.id;
            const x1 = parseFloat(lg.getAttribute('x1') || '0%') / 100;
            const y1 = parseFloat(lg.getAttribute('y1') || '0%') / 100;
            const x2 = parseFloat(lg.getAttribute('x2') || '100%') / 100;
            const y2 = parseFloat(lg.getAttribute('y2') || '0%') / 100;
            
            const stops: (string | number)[] = [];
            lg.querySelectorAll('stop').forEach((stop) => {
                const offsetStr = stop.getAttribute('offset') || '0';
                let offset = parseFloat(offsetStr);
                if (offsetStr.includes('%')) offset /= 100;
                
                const color = stop.getAttribute('stop-color') || '#000000';
                stops.push(offset);
                stops.push(color); 
            });

            gradients[id] = { id, x1, y1, x2, y2, stops };
        });

        // Shadows (Simple Drop Shadow support)
        const filters = defs.querySelectorAll('filter');
        filters.forEach(filter => {
            const dropShadow = filter.querySelector('feDropShadow');
            if (dropShadow) {
                shadows[filter.id] = {
                    color: dropShadow.getAttribute('flood-color') || '#000000',
                    blur: parseFloat(dropShadow.getAttribute('stdDeviation') || '0'),
                    offsetX: parseFloat(dropShadow.getAttribute('dx') || '0'),
                    offsetY: parseFloat(dropShadow.getAttribute('dy') || '0'),
                    opacity: parseFloat(dropShadow.getAttribute('flood-opacity') || '1')
                };
            }
        });
    }

    // 3. Helper Functions
    
    const getLocalTransform = (el: Element) => {
        let x = 0, y = 0, rot = 0, sx = 1, sy = 1;
        const tf = el.getAttribute('transform');
        if (tf) {
            // Translate
            const tMatch = tf.match(/translate\(([^)]+)\)/);
            if (tMatch) {
                const parts = tMatch[1].split(/[\s,]+/).map(parseFloat);
                x = parts[0] || 0;
                y = parts[1] || 0;
            }
            // Rotate
            const rMatch = tf.match(/rotate\(([^)]+)\)/);
            if (rMatch) {
                const parts = rMatch[1].split(/[\s,]+/).map(parseFloat);
                rot = parts[0] || 0;
            }
            // Scale
            const sMatch = tf.match(/scale\(([^)]+)\)/);
            if (sMatch) {
                const parts = sMatch[1].split(/[\s,]+/).map(parseFloat);
                sx = parts[0] || 1;
                sy = parts[1] !== undefined ? parts[1] : sx;
            }
        }
        return { x, y, rot, sx, sy };
    };

    const getAttribute = (el: Element, name: string, fallback: string) => {
        const style = el.getAttribute('style');
        if (style) {
            const match = style.match(new RegExp(`${name}\\s*:\\s*([^;]+)`));
            if (match) return match[1].trim();
        }
        return el.getAttribute(name) || fallback;
    };

    const convertPolyToPath = (points: string, closed: boolean) => {
        const ptrs = points.trim().split(/\s+|,/);
        let d = "";
        for (let i = 0; i < ptrs.length; i += 2) {
            const x = ptrs[i];
            const y = ptrs[i+1];
            if (i === 0) d += `M${x} ${y}`;
            else d += ` L${x} ${y}`;
        }
        if (closed) d += " Z";
        return d;
    };

    // 4. Recursive Node Parsing
    const parseNode = (node: Element, parentTf: TransformState) => {
        if (node.nodeType !== 1) return; // Process only Elements

        const tag = node.tagName.toLowerCase();
        const localTf = getLocalTransform(node);

        const absScaleX = parentTf.scaleX * localTf.sx;
        const absScaleY = parentTf.scaleY * localTf.sy;
        const absRotate = parentTf.rotate + localTf.rot;
        
        const absX = parentTf.translateX + (localTf.x * parentTf.scaleX);
        const absY = parentTf.translateY + (localTf.y * parentTf.scaleY);

        const absOpacity = parentTf.opacity * parseFloat(getAttribute(node, 'opacity', '1'));
        
        // Common Styles
        const rawFill = getAttribute(node, 'fill', '#000000');
        const rawStroke = getAttribute(node, 'stroke', '');
        const strokeWidth = parseFloat(getAttribute(node, 'stroke-width', '0')) * scale * absScaleX;
        const strokeLineCap = getAttribute(node, 'stroke-linecap', 'butt') as any;
        const strokeLineJoin = getAttribute(node, 'stroke-linejoin', 'miter') as any;

        // Shadow Resolution
        const filterUrl = getAttribute(node, 'filter', '');
        let shadowProps = {};
        if (filterUrl.startsWith('url(#')) {
            const id = filterUrl.replace(/url\(#|\)/g, '');
            const shadow = shadows[id];
            if (shadow) {
                shadowProps = {
                    shadowColor: shadow.color,
                    shadowBlur: shadow.blur * scale, // scale shadow
                    shadowOffsetX: shadow.offsetX * scale,
                    shadowOffsetY: shadow.offsetY * scale,
                    shadowOpacity: shadow.opacity
                };
            }
        }

        // Gradient Resolution
        let fill = rawFill;
        let fillPriority: 'color' | 'linear-gradient' = 'color';
        let gradientProps: any = {};

        if (rawFill.startsWith('url(#')) {
            const id = rawFill.replace(/url\(#|\)/g, '');
            const grad = gradients[id];
            if (grad) {
                fillPriority = 'linear-gradient';
                gradientProps = {
                    fillLinearGradientColorStops: grad.stops,
                    _gradRef: grad 
                };
            } else {
                fill = '#000000'; 
            }
        } else if (rawFill === 'none') {
            fill = ''; 
        }

        const id = uuidv4();
        const commonProps = {
            id,
            opacity: absOpacity,
            rotation: absRotate,
            scaleX: 1, 
            scaleY: 1,
            stroke: rawStroke === 'none' ? undefined : rawStroke,
            strokeWidth: rawStroke === 'none' ? 0 : strokeWidth,
            strokeLineCap,
            strokeLineJoin,
            fill: fillPriority === 'color' ? fill : undefined,
            fillPriority,
            ...gradientProps,
            ...shadowProps
        };

        // --- Element Handling ---

        if (tag === 'g') {
            Array.from(node.children).forEach(child => {
                parseNode(child, {
                    translateX: absX,
                    translateY: absY,
                    rotate: absRotate,
                    scaleX: absScaleX,
                    scaleY: absScaleY,
                    opacity: absOpacity
                });
            });
        }
        else if (tag === 'rect') {
            const w = parseFloat(getAttribute(node, 'width', '0'));
            const h = parseFloat(getAttribute(node, 'height', '0'));
            const x = parseFloat(getAttribute(node, 'x', '0'));
            const y = parseFloat(getAttribute(node, 'y', '0'));
            const rx = parseFloat(getAttribute(node, 'rx', '0'));

            const finalW = w * absScaleX * scale;
            const finalH = h * absScaleY * scale;
            const finalX = (absX + x * absScaleX) * scale + offsetX;
            const finalY = (absY + y * absScaleY) * scale + offsetY;
            const finalCornerRadius = rx * absScaleX * scale;

            // Resolve Gradient Coords
            let gradCoords = {};
            if (fillPriority === 'linear-gradient' && gradientProps._gradRef) {
                const g = gradientProps._gradRef;
                gradCoords = {
                    fillLinearGradientStartPointX: g.x1 * finalW,
                    fillLinearGradientStartPointY: g.y1 * finalH,
                    fillLinearGradientEndPointX: g.x2 * finalW,
                    fillLinearGradientEndPointY: g.y2 * finalH,
                };
            }

            elements.push({
                ...commonProps,
                type: 'rect',
                x: finalX,
                y: finalY,
                width: finalW,
                height: finalH,
                cornerRadius: finalCornerRadius,
                ...gradCoords
            });
        }
        else if (tag === 'circle') {
            const r = parseFloat(getAttribute(node, 'r', '0'));
            const cx = parseFloat(getAttribute(node, 'cx', '0'));
            const cy = parseFloat(getAttribute(node, 'cy', '0'));

            const finalR = r * absScaleX * scale;
            const finalX = (absX + cx * absScaleX) * scale + offsetX;
            const finalY = (absY + cy * absScaleY) * scale + offsetY;
            
            elements.push({
                ...commonProps,
                type: 'circle',
                x: finalX,
                y: finalY,
                width: finalR * 2,
                height: finalR * 2,
            });
        }
        else if (tag === 'text') {
            const x = parseFloat(getAttribute(node, 'x', '0'));
            const y = parseFloat(getAttribute(node, 'y', '0'));
            const content = node.textContent?.trim() || 'Text';
            
            const fontSize = parseFloat(getAttribute(node, 'font-size', '16'));
            const fontFamily = getAttribute(node, 'font-family', 'Inter');
            
            // Handle Font Styles (Bold/Italic)
            const fontWeight = getAttribute(node, 'font-weight', 'normal');
            const fontStyleAttr = getAttribute(node, 'font-style', 'normal');
            let fontStyle = 'normal';
            
            const isBold = fontWeight === 'bold' || parseInt(fontWeight) >= 700;
            const isItalic = fontStyleAttr === 'italic';

            if (isBold && isItalic) fontStyle = 'italic bold';
            else if (isBold) fontStyle = 'bold';
            else if (isItalic) fontStyle = 'italic';

            // Handle Text Decoration
            const textDecoration = getAttribute(node, 'text-decoration', '');

            // Handle Alignment & Anchoring
            const textAnchor = getAttribute(node, 'text-anchor', 'start');

            const finalFontSize = fontSize * absScaleX * scale;
            const finalX = (absX + x * absScaleX) * scale + offsetX;
            const finalY = (absY + y * absScaleY) * scale + offsetY - (finalFontSize * 0.2); // Adjust for generic SVG baseline vs Top-Left

            let align = 'left';
            let adjX = finalX;
            // Give text a generous width to allow editing, centering relative to anchor point
            const defaultWidth = Math.max(500 * scale, finalFontSize * content.length * 0.8); 

            if (textAnchor === 'middle') {
                align = 'center';
                adjX = finalX - (defaultWidth / 2);
            } else if (textAnchor === 'end') {
                align = 'right';
                adjX = finalX - defaultWidth;
            }

            elements.push({
                ...commonProps,
                type: 'text',
                text: content,
                x: adjX,
                y: finalY,
                width: defaultWidth,
                fontSize: finalFontSize,
                fontFamily,
                fontStyle,
                textDecoration,
                align,
                fill: commonProps.fill || '#000000'
            });
        }
        else if (tag === 'path' || tag === 'polygon' || tag === 'polyline') {
            let d = '';
            
            if (tag === 'path') {
                d = getAttribute(node, 'd', '');
            } else if (tag === 'polygon') {
                const points = getAttribute(node, 'points', '');
                d = convertPolyToPath(points, true);
            } else if (tag === 'polyline') {
                const points = getAttribute(node, 'points', '');
                d = convertPolyToPath(points, false);
            }

            const finalX = absX * scale + offsetX;
            const finalY = absY * scale + offsetY;
            const finalScale = absScaleX * scale;

            elements.push({
                ...commonProps,
                type: 'path',
                data: d,
                x: finalX,
                y: finalY,
                scaleX: finalScale,
                scaleY: finalScale,
                width: 100, 
                height: 100
            });
        }
        else if (tag === 'image') {
            const href = getAttribute(node, 'href', '') || getAttribute(node, 'xlink:href', '');
            const w = parseFloat(getAttribute(node, 'width', '100'));
            const h = parseFloat(getAttribute(node, 'height', '100'));
            const x = parseFloat(getAttribute(node, 'x', '0'));
            const y = parseFloat(getAttribute(node, 'y', '0'));

            const finalW = w * absScaleX * scale;
            const finalH = h * absScaleY * scale;
            const finalX = (absX + x * absScaleX) * scale + offsetX;
            const finalY = (absY + y * absScaleY) * scale + offsetY;
            
            // Use provided href, or if empty, user can upload image later.
            // Konva Image component handles loading errors gracefully usually,
            // or we can use a placeholder image if src is empty.
            const src = href || ''; 

            elements.push({
                ...commonProps,
                type: 'image',
                src,
                x: finalX,
                y: finalY,
                width: finalW,
                height: finalH
            });
        }
    };

    // Start Recursion
    Array.from(svg.children).forEach(child => {
        parseNode(child, {
            translateX: 0,
            translateY: 0,
            rotate: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1
        });
    });

    return elements;
};