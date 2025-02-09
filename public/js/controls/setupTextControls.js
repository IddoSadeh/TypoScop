// setupTextControls.js
import { textParams } from '../parameters/textParams.js';
import { createText } from '../utils/three.setup.js';
import fontManager from '../utils/fontManager.js';

// Add debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function setupTextControls() {
    const textInput = document.getElementById('ai-text-input');
    const fontSelect = document.getElementById('ai-font-name');
    const heightSlider = document.getElementById('text-height-slider');
    const letterSpacingSlider = document.getElementById('letter-spacing-slider');

    // Debounced text update function
    const updateText = debounce((value) => {
        textParams.text = value;
        const { font } = fontManager.processText(value, textParams.font);
        textParams.font = font;
        createText();
    }, 500); // 300ms delay

    // Text input
    textInput?.addEventListener('input', (e) => {
        updateText(e.target.value);
    });

    // Font selection
    fontSelect?.addEventListener('change', (e) => {
        const { font } = fontManager.processText(textParams.text, e.target.value);
        textParams.font = font;
        createText();
    });

    // Height
    heightSlider?.addEventListener('input', (e) => {
        textParams.height = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = textParams.height;
        createText();
    });

    // Letter Spacing
    letterSpacingSlider?.addEventListener('input', (e) => {
        textParams.letterSpacing = parseFloat(e.target.value);
        e.target.nextElementSibling.textContent = textParams.letterSpacing;
        createText();
    });

    // Initialize available fonts in the dropdown
    initializeFontSelect(fontSelect);
}

function initializeFontSelect(fontSelect) {
    if (!fontSelect) return;

    // Clear existing options
    fontSelect.innerHTML = '';
    
    // Get available fonts from font manager
    const availableFonts = fontManager.getAvailableFonts();
    
    // Add Latin fonts group
    if (availableFonts.latin.length > 0) {
        const latinGroup = document.createElement('optgroup');
        latinGroup.label = 'Latin Fonts';
        availableFonts.latin.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font.charAt(0).toUpperCase() + font.slice(1);
            latinGroup.appendChild(option);
        });
        fontSelect.appendChild(latinGroup);
    }
    
    // Add Hebrew fonts group
    if (availableFonts.hebrew.length > 0) {
        const hebrewGroup = document.createElement('optgroup');
        hebrewGroup.label = 'Hebrew Fonts';
        availableFonts.hebrew.forEach(font => {
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font.charAt(0).toUpperCase() + font.slice(1);
            hebrewGroup.appendChild(option);
        });
        fontSelect.appendChild(hebrewGroup);
    }
}