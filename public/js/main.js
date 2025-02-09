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

function autoExpand(field) {
    // Reset field height
    field.style.height = 'inherit';

    // Get the computed styles for the element
    const computed = window.getComputedStyle(field);

    // Calculate the height
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + field.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

    field.style.height = `${height}px`;
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

    const textarea = document.getElementById('promptInput');
    if (textarea) {
        // Convert input to textarea if it's not already
        if (textarea.tagName.toLowerCase() !== 'textarea') {
            const newTextarea = document.createElement('textarea');
            for (let attr of textarea.attributes) {
                newTextarea.setAttribute(attr.name, attr.value);
            }
            textarea.parentNode.replaceChild(newTextarea, textarea);
            
            // Add auto-expand functionality
            newTextarea.addEventListener('input', function() {
                autoExpand(this);
            });
            
            // Handle initial content if any
            autoExpand(newTextarea);
        }
    }
});