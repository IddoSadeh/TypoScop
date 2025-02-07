// Add this to a new file like utils/exportParams.js

import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';

export function exportCurrentParams() {
    // Collect all parameters into one object
    const currentParams = {
        text: textParams,
        material: materialParams,
        scene: sceneParams,
        animation: animationParams,
        projection: projectionParams
    };

    // Create a Blob with the JSON data
    const blob = new Blob(
        [JSON.stringify(currentParams, null, 2)], 
        { type: 'application/json' }
    );

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
    link.download = `scene_params_${timestamp}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}