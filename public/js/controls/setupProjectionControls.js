// setupProjectionControls.js
import { animationParams } from '../parameters/animationParams.js';
import { projectTextMesh } from '../utils/animationManager.js';

export function setupProjectionControls() {
  const projectionToggle = document.getElementById('projection-toggle'); // A checkbox
  const projectionModeSelect = document.getElementById('projection-mode');
  const projectionScaleSlider = document.getElementById('projection-scale');
  const projectionScaleValue = document.getElementById('projection-scale-value');

  if (projectionToggle) {
    projectionToggle.addEventListener('change', (e) => {
      animationParams.projectionEnabled = e.target.checked;
      projectTextMesh();
    });
  }

  if (projectionModeSelect) {
    projectionModeSelect.addEventListener('change', (e) => {
      animationParams.projectionMode = e.target.value;
      if (animationParams.projectionEnabled) {
        projectTextMesh();
      }
    });
  }

  if (projectionScaleSlider) {
    projectionScaleSlider.addEventListener('input', (e) => {
      animationParams.projectionScale = parseFloat(e.target.value);
      if (projectionScaleValue) {
        projectionScaleValue.textContent = animationParams.projectionScale.toFixed(1);
      }
      if (animationParams.projectionEnabled) {
        projectTextMesh();
      }
    });
  }
}
