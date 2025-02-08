import { initThreeJS } from './utils/three.setup.js';
import { setupTextControls } from './controls/setupTextControls.js';
import { setupMaterialControls } from './controls/setupMaterialControls.js';
import { setupSceneControls } from './controls/setupSceneControls.js';
import { setupChatInterface } from './utils/chatInterface.js';
import { setupAnimationControls } from './controls/setupAnimationControls.js';
import { setupProjectionControls } from './controls/setupProjectionControls.js';
import { exportCurrentParams } from './utils/exportParams.js';
import { initSaveSystem } from './utils/saveSystem.js';
import { initResetButton } from './utils/resetScene.js';

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

function setupExportButton() {
    const exportButton = document.getElementById('export-params');
    if (exportButton) {
        exportButton.addEventListener('click', exportCurrentParams);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }

    // Initialize Three.js scene - only call once and store result
    const sceneElements = initThreeJS(container);

    // Initialize save system with scene elements
    initSaveSystem(
        sceneElements.scene, 
        sceneElements.camera, 
        sceneElements.renderer, 
        sceneElements.textMesh
    );

    // Setup all controls
    setupTextControls();
    setupMaterialControls();
    setupSceneControls();
    setupAnimationControls(); 
    setupChatInterface();
    setupProjectionControls();
    setupExportButton();
    initResetButton();
    // Setup UI components
    setupTabs();
    setupCollapsibles();
});