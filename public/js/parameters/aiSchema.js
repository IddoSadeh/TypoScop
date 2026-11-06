export const parameters = {
  "color": {
    "type": "string",
    "pattern": "^#[0-9a-fA-F]{6}$"
  },
  "height": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 5
  },
  "metalness": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "roughness": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "backgroundColor": {
    "type": "string",
    "pattern": "^#[0-9a-fA-F]{6}$"
  },
  "scrambleEnabled": {
    "type": "boolean"
  },
  "scrambleSpeed": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 2
  },
  "scrambleIntensity": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 3
  },
  "scrambleMode": {
    "type": "string",
    "enum": [
      "random",
      "swap",
      "circular"
    ]
  },
  "multiTextEnabled": {
    "type": "boolean"
  },
  "copyCount": {
    "type": "integer",
    "minimum": 1,
    "maximum": 5
  },
  "spread": {
    "type": "number",
    "minimum": 10,
    "maximum": 100
  },
  "tessellationEnabled": {
    "type": "boolean"
  },
  "tessellationSegments": {
    "type": "integer",
    "minimum": 1,
    "maximum": 12
  },
  "wireframeEnabled": {
    "type": "boolean"
  },
  "wireframeOpacity": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 1
  },
  "colorHueStart": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorHueRange": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorSatStart": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorSatRange": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorLightStart": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorLightRange": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "colorPattern": {
    "type": "string",
    "enum": [
      "random",
      "gradient",
      "waves"
    ]
  },
  "manipulationAnimationEnabled": {
    "type": "boolean"
  },
  "manipulationAnimationSpeed": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 2
  },
  "manipulationAnimationIntensity": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 3
  },
  "particlesEnabled": {
    "type": "boolean"
  },
  "particleShape": {
    "type": "string",
    "enum": [
      "sphere",
      "cube",
      "torus"
    ]
  },
  "particleSize": {
    "type": "number",
    "minimum": 0.03,
    "maximum": 1
  },
  "particleDensity": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 1
  },
  "particleRandomness": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "particleScale": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 2
  },
  "backgroundOpacity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "fogEnabled": {
    "type": "boolean"
  },
  "fogColor": {
    "type": "string",
    "pattern": "^#[0-9a-fA-F]{6}$"
  },
  "fogDensity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "ambientLightIntensity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "mainLightIntensity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "fillLightIntensity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "cameraDistance": {
    "type": "number",
    "minimum": 10,
    "maximum": 100
  },
  "fieldOfView": {
    "type": "number",
    "minimum": 10,
    "maximum": 120
  },
  "scenePositionX": {
    "type": "number",
    "minimum": -50,
    "maximum": 50
  },
  "scenePositionY": {
    "type": "number",
    "minimum": -50,
    "maximum": 50
  },
  "textSize": {
    "type": "number",
    "minimum": 1,
    "maximum": 10
  },
  "letterSpacing": {
    "type": "number",
    "minimum": 0,
    "maximum": 2
  },
  "curveSegments": {
    "type": "integer",
    "minimum": 4,
    "maximum": 16
  },
  "bevelEnabled": {
    "type": "boolean"
  },
  "bevelThickness": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "bevelSize": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "bevelSegments": {
    "type": "integer",
    "minimum": 1,
    "maximum": 5
  },
  "projectionEnabled": {
    "type": "boolean"
  },
  "projectionType": {
    "type": "string",
    "enum": [
      "standard",
      "pattern"
    ]
  },
  "projectionMode": {
    "type": "string",
    "enum": [
      "torusknot",
      "donut",
      "sphere",
      "cube",
      "cylinder",
      "cone",
      "octahedron"
    ]
  },
  "projectionScale": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 3
  },
  "patternAnimatePattern": {
    "type": "boolean"
  },
  "patternAnimationDirection": {
    "type": "string",
    "enum": [
      "vertical",
      "horizontal",
      "diagonal"
    ]
  },
  "patternAnimationSpeed": {
    "type": "number",
    "minimum": 0.001,
    "maximum": 0.05
  },
  "patternAnimationReverse": {
    "type": "boolean"
  },
  "patternRepeatX": {
    "type": "integer",
    "minimum": 1,
    "maximum": 20
  },
  "patternRepeatY": {
    "type": "integer",
    "minimum": 1,
    "maximum": 20
  },
  "patternLetterSpacing": {
    "type": "number",
    "minimum": 0,
    "maximum": 2
  },
  "patternWordSpacing": {
    "type": "number",
    "minimum": 0.5,
    "maximum": 3
  },
  "patternBackgroundColor": {
    "type": "string",
    "pattern": "^#[0-9a-fA-F]{6}$"
  },
  "patternTextColor": {
    "type": "string",
    "pattern": "^#[0-9a-fA-F]{6}$"
  },
  "patternOpacity": {
    "type": "number",
    "minimum": 0,
    "maximum": 1
  },
  "text": {
    "type": "string",
    "maxLength": 48
  },
  "font": {
    "type": "string",
    "enum": [
      "helvetiker",
      "optimer",
      "gentilis",
      "haim"
    ]
  },
  "rotateX": {
    "type": "number",
    "minimum": -0.03,
    "maximum": 0.03
  },
  "rotateXEnabled": {
    "type": "boolean"
  },
  "rotateY": {
    "type": "number",
    "minimum": -0.03,
    "maximum": 0.03
  },
  "rotateYEnabled": {
    "type": "boolean"
  },
  "rotateZ": {
    "type": "number",
    "minimum": -0.03,
    "maximum": 0.03
  },
  "rotateZEnabled": {
    "type": "boolean"
  },
  "scaleEnabled": {
    "type": "boolean"
  },
  "scaleSpeed": {
    "type": "number",
    "minimum": 0.001,
    "maximum": 0.04
  },
  "scaleMin": {
    "type": "number",
    "minimum": 0.5,
    "maximum": 1
  },
  "scaleMax": {
    "type": "number",
    "minimum": 1,
    "maximum": 1.5
  },
  "motionMode": {
    "type": "string",
    "enum": [
      "none",
      "wave",
      "twist",
      "ripple",
      "float"
    ]
  },
  "motionAmplitude": {
    "type": "number",
    "minimum": 0,
    "maximum": 2
  },
  "motionSpeed": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 2
  },
  "motionFrequency": {
    "type": "number",
    "minimum": 0.1,
    "maximum": 1
  }
};
