import { initThreeJS } from './utils/three.setup.js';
import { setupTextControls } from './controls/setupTextControls.js';
import { setupMaterialControls } from './controls/setupMaterialControls.js';
import { setupSceneControls } from './controls/setupSceneControls.js';
import { setupChatInterface } from './utils/chatInterface.js';
import { setupAnimationControls } from './controls/setupAnimationControls.js';

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const aiTab = document.getElementById('ai-tab');
    const manualTab = document.getElementById('manual-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            button.classList.add('active');
            
            const tabId = button.dataset.tab;
            if (tabId === 'ai') {
                aiTab.style.display = 'flex';
                manualTab.style.display = 'none';
            } else {
                aiTab.style.display = 'none';
                manualTab.style.display = 'block';
            }
        });
    });
}

function setupCollapsibles() {
    document.querySelectorAll('.collapsible').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.maxHeight = this.classList.contains('active') ? 
                `${content.scrollHeight}px` : null;
            content.classList.toggle('show');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }

    // Initialize Three.js scene
    initThreeJS(container);

    // Setup all controls
    setupTextControls();
    setupMaterialControls();
    setupSceneControls();
    setupAnimationControls(); 
    setupChatInterface();


    // Setup UI components
    setupTabs();
    setupCollapsibles();
});