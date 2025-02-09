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

function setupEditModeToggle() {
    const toggleButton = document.getElementById('edit-mode-toggle');
    const aiTab = document.getElementById('ai-tab');
    const manualTab = document.getElementById('manual-tab');

    // Start with AI mode
    aiTab.style.display = 'flex';
    manualTab.style.display = 'none';

    toggleButton?.addEventListener('click', () => {
        toggleButton.classList.toggle('active');
        if (toggleButton.classList.contains('active')) {
            // Switch to manual mode
            aiTab.style.display = 'none';
            manualTab.style.display = 'block';
        } else {
            // Switch to AI mode
            aiTab.style.display = 'flex';
            manualTab.style.display = 'none';
        }
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


// Add this to your main.js or create a new module

function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenuDropdown = document.querySelector('.mobile-menu-dropdown');
    const mobileSave = document.getElementById('mobile-save');
    const mobileEdit = document.getElementById('mobile-edit');
    const mobileReset = document.getElementById('mobile-reset');

    // Toggle menu
    mobileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenuDropdown.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenuDropdown.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            mobileMenuDropdown.classList.remove('show');
        }
    });

    // Handle save button click
    mobileSave.addEventListener('click', () => {
        // Add save options to dropdown
        const saveOptions = document.createElement('div');
        saveOptions.className = 'save-options show';
        saveOptions.innerHTML = `
            <button class="mobile-menu-item" data-type="png">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Export as PNG
            </button>
            <button class="mobile-menu-item" data-type="mp4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                Export as WebM
            </button>
            <button class="mobile-menu-item" data-type="obj">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                </svg>
                Export as OBJ
            </button>
        `;
        
        // Replace existing save options if any
        const existingSaveOptions = mobileMenuDropdown.querySelector('.save-options');
        if (existingSaveOptions) {
            existingSaveOptions.remove();
        }
        mobileMenuDropdown.appendChild(saveOptions);
    });

    // Link mobile buttons to their desktop counterparts
    mobileEdit.addEventListener('click', () => {
        document.getElementById('edit-mode-toggle').click();
        mobileMenuDropdown.classList.remove('show');
    });

    mobileReset.addEventListener('click', () => {
        document.getElementById('reset-button').click();
        mobileMenuDropdown.classList.remove('show');
    });
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
    setupEditModeToggle();
    setupCollapsibles();
    setupMobileMenu();

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