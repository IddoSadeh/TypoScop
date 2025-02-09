// saveSystem.js
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
import { animationParams } from '../parameters/animationParams.js';

export function initSaveSystem(scene, camera, renderer, textMesh) {
    // Get DOM elements
    const saveButton = document.getElementById('save-button');
    const saveOptions = document.getElementById('save-options');
    const objExportButton = document.getElementById('obj-export-button');
    const saveMenu = document.getElementById('save-menu');

    if (!saveButton || !saveOptions || !objExportButton || !saveMenu) {
        console.error('Save menu elements not found');
        return;
    }

    // Toggle menu
    saveButton.addEventListener('click', () => {
        const isHidden = saveOptions.classList.contains('hidden');
        saveOptions.classList.toggle('hidden', !isHidden);
        saveOptions.classList.toggle('show', isHidden);
        
        // Update OBJ export button visibility
        const isSingleGeometry = !animationParams.multiTextEnabled && !animationParams.scrambleEnabled;
        objExportButton.style.display = isSingleGeometry ? 'flex' : 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!saveMenu.contains(event.target)) {
            saveOptions.classList.add('hidden');
            saveOptions.classList.remove('show');
        }
    });

    // Export functions
    const exportFunctions = {
        async png() {
            renderer.render(scene, camera);
            const dataURL = renderer.domElement.toDataURL('image/png');
            downloadFile(dataURL, 'typography-scene.png');
        },

        async mp4() {
            try {
                // Show loading indicator
                const loadingMessage = document.createElement('div');
                loadingMessage.textContent = 'Recording and converting video...';
                loadingMessage.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    z-index: 9999;
                `;
                document.body.appendChild(loadingMessage);

                // Record WebM
                const stream = renderer.domElement.captureStream(30);
                const mediaRecorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm',
                    videoBitsPerSecond: 5000000
                });

                const chunks = [];
                
                await new Promise((resolve, reject) => {
                    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                    mediaRecorder.onstop = resolve;
                    mediaRecorder.onerror = reject;
                    
                    mediaRecorder.start();
                    setTimeout(() => mediaRecorder.stop(), 5000); // Record for 5 seconds
                });

                // Create WebM blob
                const webmBlob = new Blob(chunks, { type: 'video/webm' });

                // Convert to MP4
                const response = await fetch('/api/convert-video', {
                    method: 'POST',
                    body: webmBlob
                });

                if (!response.ok) {
                    throw new Error('Video conversion failed');
                }

                const mp4Blob = await response.blob();
                const url = URL.createObjectURL(mp4Blob);
                downloadFile(url, 'typography-animation.mp4');
                URL.revokeObjectURL(url);

            } catch (error) {
                console.error('Failed to create MP4:', error);
                alert('Failed to create MP4. Falling back to WebM format.');
                
                // Fallback to WebM
                const webmBlob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(webmBlob);
                downloadFile(url, 'typography-animation.webm');
                URL.revokeObjectURL(url);
            } finally {
                // Remove loading message
                const loadingMessage = document.querySelector('div');
                if (loadingMessage) {
                    loadingMessage.remove();
                }
            }
        },

        async obj() {
            if (!textMesh) return;
            const exporter = new OBJExporter();
            const data = exporter.parse(textMesh);
            const blob = new Blob([data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            downloadFile(url, 'typography-model.obj');
            URL.revokeObjectURL(url);
        }
    };

    // Handle export option clicks
    saveOptions.addEventListener('click', async (event) => {
        const button = event.target.closest('.save-option');
        if (!button) return;

        const exportType = button.dataset.type;
        if (exportFunctions[exportType]) {
            try {
                saveOptions.classList.add('hidden');
                saveOptions.classList.remove('show');
                await exportFunctions[exportType]();
            } catch (error) {
                console.error(`Export failed: ${error}`);
            }
        }
    });

    // Helper function to download files
    function downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}