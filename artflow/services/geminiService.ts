import { GoogleGenAI } from "@google/genai";
import { CanvasElement, Template } from '../types';

// خواندن کلید از .env (Vite)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY not set in .env.local");
}

const getAiClient = () => {
    return new GoogleGenAI({ apiKey: API_KEY });
};

const cleanJSON = (text: string) => text.replace(/```json\n?|```/g, '').trim();

const isRecoverableError = (err: any): boolean => {
    const code = err.status || err.code || err.error?.code || err.originalError?.error?.code;
    const msg = (err.message || err.originalError?.message || '').toLowerCase();
    const rawStr = typeof err === 'object' ? JSON.stringify(err).toLowerCase() : '';
    
    return code === 403 || msg.includes('permission_denied') || msg.includes('403') || rawStr.includes('permission_denied') ||
           code >= 500 || msg.includes('rpc') || msg.includes('network') || err.status === 'UNKNOWN';
};

const getAspectRatio = (prompt: string): string => {
    const p = prompt.toLowerCase();
    if (p.includes('youtube') || p.includes('thumbnail') || p.includes('16:9') || p.includes('wide')) return '16:9';
    if (p.includes('story') || p.includes('reel') || p.includes('9:16')) return '9:16';
    if (p.includes('portrait') || p.includes('3:4') || p.includes('4:5')) return '3:4';
    if (p.includes('4:3')) return '4:3';
    return '1:1';
};

const executeGeneration = async (model: string, parts: any[], config: any) => {
    const client = getAiClient();
    try {
        const response = await client.models.generateContent({ model, contents: { parts }, config });
        let newImageBase64 = '';
        if (response.candidates) {
            for (const candidate of response.candidates) {
                for (const part of candidate.content.parts || []) {
                    if (part.inlineData?.data) {
                        newImageBase64 = part.inlineData.data;
                        break;
                    }
                }
                if (newImageBase64) break;
            }
        }
        if (!newImageBase64) {
            const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
            if (textPart?.text) throw new Error(`Gemini refused: ${textPart.text.substring(0, 200)}...`);
            throw new Error("No image data returned from Gemini.");
        }
        return `data:image/png;base64,${newImageBase64}`;
    } catch (error: any) {
        if (error.error && typeof error.error === 'object') {
            const wrappedError: any = new Error(error.error.message || "Unknown API Error");
            wrappedError.code = error.error.code;
            wrappedError.status = error.error.status;
            wrappedError.originalError = error;
            throw wrappedError;
        }
        throw error;
    }
};

// --- AI Edit ---
export const generateAIEdit = async (base64Image: string, prompt: string) => {
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    const aspectRatio = getAspectRatio(prompt);
    const commonPrompt = `
      You are the ArtFlow AI Banner Studio Engine.
      TASK: Edit this image based on: "${prompt}".
      DO NOT return text, only image.
    `;
    const inputParts = [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: commonPrompt }
    ];
    try {
        return await executeGeneration('gemini-3-pro-image-preview', inputParts, { imageConfig: { imageSize: '4K', aspectRatio } });
    } catch (error: any) {
        if (isRecoverableError(error)) {
            await new Promise(r => setTimeout(r, 1000));
            return await executeGeneration('gemini-2.5-flash-image', inputParts, { imageConfig: { aspectRatio } });
        }
        throw error;
    }
};

// --- New Image ---
export const generateNewImage = async (prompt: string) => {
    const aspectRatio = getAspectRatio(prompt);
    const commonPrompt = `
      You are the ArtFlow AI Banner Studio Engine.
      TASK: Generate a new image: "${prompt}".
      DO NOT return text, only image.
    `;
    const inputParts = [{ text: commonPrompt }];
    try {
        return await executeGeneration('gemini-3-pro-image-preview', inputParts, { imageConfig: { imageSize: '4K', aspectRatio } });
    } catch (error: any) {
        if (isRecoverableError(error)) {
            await new Promise(r => setTimeout(r, 1000));
            return await executeGeneration('gemini-2.5-flash-image', inputParts, { imageConfig: { aspectRatio } });
        }
        throw error;
    }
};

// --- Layout Suggestions ---
export const generateLayoutSuggestions = async (elements: CanvasElement[], canvasConfig: Template) => {
    const client = getAiClient();
    const simplifiedElements = elements.map(el => ({
        id: el.id, type: el.type, x: el.x, y: el.y, width: el.width, height: el.height,
        rotation: el.rotation, scaleX: el.scaleX, scaleY: el.scaleY, text: el.text?.substring(0, 100), align: el.align
    }));
    const safeAreasDesc = canvasConfig.safeAreas?.map(s => `${s.label}: x=${s.x}, y=${s.y}, w=${s.width}, h=${s.height}`).join('\n') || "None";
    const prompt = `
      ArtFlow Layout Engine (Bilingual EN/FA)
      Canvas: ${canvasConfig.name} (${canvasConfig.width}x${canvasConfig.height})
      Safe Areas: ${safeAreasDesc}
      Optimize positions/sizes, respect RTL for Persian text.
      Input: ${JSON.stringify(simplifiedElements)}
      Output: JSON array of updates.
    `;
    const response = await client.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    const updates = JSON.parse(cleanJSON(response.text || '[]'));
    return elements.map(el => {
        const u = updates.find((i: any) => i.id === el.id);
        return u?.changes ? { ...el, ...u.changes } : el;
    });
};

// --- Style Suggestions ---
export const generateStyleSuggestions = async (elements: CanvasElement[], canvasConfig: Template) => {
    const client = getAiClient();
    const simplifiedElements = elements.map(el => ({
        id: el.id, type: el.type, text: el.text, fill: el.fill, fontSize: el.fontSize,
        fontFamily: el.fontFamily, fontStyle: el.fontStyle, stroke: el.stroke, shadowColor: el.shadowColor
    }));
    const prompt = `
      ArtFlow Style Engine
      Optimize typography/colors.
      For Persian text, use fontFamily: Vazirmatn.
      Input: ${JSON.stringify(simplifiedElements)}
      Output: JSON array of updates.
    `;
    const response = await client.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json" } });
    const updates = JSON.parse(cleanJSON(response.text || '[]'));
    return elements.map(el => {
        const u = updates.find((i: any) => i.id === el.id);
        return u?.changes ? { ...el, ...u.changes } : el;
    });
};
