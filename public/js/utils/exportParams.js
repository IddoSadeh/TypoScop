// Add this to utils/exportParams.js

import { textParams } from '../parameters/textParams.js';
import { materialParams } from '../parameters/materialParams.js';
import { sceneParams } from '../parameters/sceneParams.js';
import { animationParams } from '../parameters/animationParams.js';
import { projectionParams } from '../parameters/projectionParams.js';

export function exportCurrentParams() {
    // Just export the raw parameter objects
    const paramsToExport = {
        textParams,
        materialParams,
        sceneParams,
        animationParams,
        projectionParams
    };

    const blob = new Blob(
        [JSON.stringify(paramsToExport, null, 2)], 
        { type: 'application/json' }
    );
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Simple timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `scene_${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}