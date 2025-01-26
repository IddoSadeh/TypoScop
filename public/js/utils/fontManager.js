// fontManager.js
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

class FontManager {
    constructor() {
        this.fontCache = new Map();
        
        // Font mapping object
        this.FONTS = {
            latin: {
                helvetiker: 'https://unpkg.com/three@0.152.0/examples/fonts/helvetiker_regular.typeface.json',
                optimer: 'https://unpkg.com/three@0.152.0/examples/fonts/optimer_regular.typeface.json',
                gentilis: 'https://unpkg.com/three@0.152.0/examples/fonts/gentilis_regular.typeface.json'
            },
            hebrew: {
                haim: '/fonts/Haim Classic v2 FM_Regular.json'
            }
        };
    }

    isRTL(text) {
        return /[\u0590-\u05FF]/.test(text);
    }

    getFontType(fontName) {
        if (!fontName) return null;
        const normalizedName = fontName.toLowerCase();
        if (this.FONTS.hebrew[normalizedName]) return 'hebrew';
        if (this.FONTS.latin[normalizedName]) return 'latin';
        return null;
    }

    getAvailableFonts() {
        return {
            latin: Object.keys(this.FONTS.latin),
            hebrew: Object.keys(this.FONTS.hebrew)
        };
    }

    processText(text, currentFont) {
        const containsHebrew = this.isRTL(text);
        const currentFontType = this.getFontType(currentFont);
        
        let selectedFont;
        if (containsHebrew && currentFontType !== 'hebrew') {
            selectedFont = 'haim';
            this.updateFontDropdown('haim');
        } else {
            selectedFont = currentFont?.toLowerCase() || 'helvetiker';
        }
        
        // Reverse text if Hebrew
        const processedText = containsHebrew ? text.split('').reverse().join('') : text;
        
        return {
            text: processedText,
            font: selectedFont,
            isHebrew: containsHebrew
        };
    }

    updateFontDropdown(fontName) {
        const fontSelect = document.getElementById('ai-font-name');
        if (fontSelect && fontSelect.value !== fontName) {
            fontSelect.value = fontName;
        }
    }

    loadFont(fontName, isHebrew = false) {
        // Check if font is already cached
        if (this.fontCache.has(fontName)) {
            return Promise.resolve(this.fontCache.get(fontName));
        }

        const loader = new FontLoader();
        let fontUrl;

        if (isHebrew) {
            fontUrl = this.FONTS.hebrew[fontName] || this.FONTS.hebrew.haim;
        } else {
            fontUrl = this.FONTS.latin[fontName] || this.FONTS.latin.helvetiker;
        }

        return new Promise((resolve, reject) => {
            loader.load(
                fontUrl,
                (font) => {
                    this.fontCache.set(fontName, font);
                    resolve(font);
                },
                undefined,
                (error) => reject(error)
            );
        });
    }

    // Method to preload commonly used fonts
    preloadFonts() {
        const fontsToPreload = ['helvetiker', 'haim'];
        const preloadPromises = fontsToPreload.map(fontName => {
            const isHebrew = this.getFontType(fontName) === 'hebrew';
            return this.loadFont(fontName, isHebrew)
                .catch(error => console.warn(`Failed to preload font ${fontName}:`, error));
        });
        
        return Promise.all(preloadPromises);
    }

    // Get a loaded font from cache
    getFont(fontName) {
        return this.fontCache.get(fontName.toLowerCase());
    }

    // Check if a font is loaded
    isFontLoaded(fontName) {
        return this.fontCache.has(fontName.toLowerCase());
    }

    // Clear font cache
    clearCache() {
        this.fontCache.clear();
    }
}

// Create and export a singleton instance
const fontManager = new FontManager();
export default fontManager;