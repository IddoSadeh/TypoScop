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

    // Function to toggle save options
    function toggleSaveOptions() {
        const isHidden = saveOptions.style.display === "none" || saveOptions.classList.contains("hidden");
        
        if (isHidden) {
            saveOptions.style.display = "block"; // Show menu
            saveOptions.classList.remove("hidden");
            saveOptions.classList.add("show");
        } else {
            saveOptions.style.display = "none"; // Hide menu
            saveOptions.classList.add("hidden");
            saveOptions.classList.remove("show");
        }

        // Update OBJ export button visibility
        const isSingleGeometry = !animationParams.multiTextEnabled && !animationParams.scrambleEnabled;
        objExportButton.style.display = isSingleGeometry ? "flex" : "none";
    }

    // Toggle menu on save button click
    saveButton.addEventListener("click", toggleSaveOptions);

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
        if (!saveMenu.contains(event.target) && !saveButton.contains(event.target)) {
            saveOptions.style.display = "none"; // Ensure it fully disappears
            saveOptions.classList.add("hidden");
            saveOptions.classList.remove("show");
        }
    });

    // Export functions
    const exportFunctions = {
        async png() {
            renderer.render(scene, camera);
            const dataURL = renderer.domElement.toDataURL("image/png");
            downloadFile(dataURL, "typography-scene.png");
        },

        async mp4() {
            const mimeTypes = [
                "video/mp4;codecs=h264",
                "video/webm;codecs=vp9",
                "video/webm",
            ];

            const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));

            if (!mimeType) {
                console.error("No supported video format found");
                return;
            }

            const stream = renderer.domElement.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 5000000,
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const extension = mimeType.includes("mp4") ? "mp4" : "webm";
                downloadFile(url, `typography-animation.${extension}`);
                URL.revokeObjectURL(url);
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 5000);
        },

        async obj() {
            if (!textMesh) return;
            const exporter = new OBJExporter();
            const data = exporter.parse(textMesh);
            const blob = new Blob([data], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            downloadFile(url, "typography-model.obj");
            URL.revokeObjectURL(url);
        },
    };

    // Handle export option clicks
    saveOptions.addEventListener("click", async (event) => {
        const button = event.target.closest(".save-option");
        if (!button) return;

        const exportType = button.dataset.type;
        if (exportFunctions[exportType]) {
            try {
                saveOptions.style.display = "none"; // Hide after clicking
                saveOptions.classList.add("hidden");
                saveOptions.classList.remove("show");
                await exportFunctions[exportType]();
            } catch (error) {
                console.error(`Export failed: ${error}`);
            }
        }
    });

    // Helper function to download files
    function downloadFile(url, filename) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
