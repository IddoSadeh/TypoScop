import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

let scene, camera, renderer, textMesh;
let userText = ""; // Store the user's entered text globally

function initScene() {
  const container = document.getElementById("canvas-container");
  if (!container) {
    console.error("No element with ID 'canvas-container' found");
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffffff");

  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  animate();
}

/**
 * Renders the userText in the specified color. The global 'userText' is used,
 * so we always display the text the user typed originally.
 */
function renderText(text, color = "#0077ff") {
  const loader = new FontLoader();
  
  loader.load(
    "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/fonts/helvetiker_regular.typeface.json",
    (font) => {
      const geometry = new TextGeometry(text, {
        font,
        size: 1,
        height: 0.2,
      });

      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });

      if (textMesh) scene.remove(textMesh);
      textMesh = new THREE.Mesh(geometry, material);
      scene.add(textMesh);
    },
    undefined,
    (error) => {
      console.error("Error loading font:", error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Process the JSON instructions from the LLM
function processAIResponse(response) {
  const cleanedResponse = response
    .replace(/```json/g, "")
    .replace(/```/g, "");

  let parsed;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch (e) {
    console.error("LLM response was not valid JSON:", e);
    chatBox.innerHTML += `<p>AI (invalid JSON): ${response}</p>`;
    return;
  }

  console.log("Parsed LLM response:", parsed);

  switch (parsed.action) {
    case "changeBackground":
      if (parsed.params?.color) {
        scene.background = new THREE.Color(parsed.params.color);
      }
      break;

    case "changeTextColor":
      if (parsed.params?.color) {
        // Use the user's original text, but with a new color
        renderText(userText, parsed.params.color);
      }
      break;

    case "createObject":
      if (parsed.params?.geometry === "box") {
        const geometry = new THREE.BoxGeometry(
          parsed.params.width || 1,
          parsed.params.height || 1,
          parsed.params.depth || 1
        );
        const material = new THREE.MeshBasicMaterial({
          color: parsed.params.color || "#00ff00",
        });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(
          parsed.params.x || 0,
          parsed.params.y || 0,
          parsed.params.z || 0
        );
        scene.add(box);
      } else if (parsed.params?.geometry === "sphere") {
        // New sphere geometry logic
        const geometry = new THREE.SphereGeometry(
          parsed.params.radius || 1,
          parsed.params.widthSegments || 16,
          parsed.params.heightSegments || 16
        );
        const material = new THREE.MeshBasicMaterial({
          color: parsed.params.color || "#00ff00",
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
          parsed.params.x || 0,
          parsed.params.y || 0,
          parsed.params.z || 0
        );
        scene.add(sphere);
      }
      break;

    case "rotateObject":
      if (textMesh && parsed.params) {
        textMesh.rotation.x += parsed.params.x || 0;
        textMesh.rotation.y += parsed.params.y || 0;
        textMesh.rotation.z += parsed.params.z || 0;
      }
      break;

    case "animateText":
      if (parsed.params?.animationType) {
        animateKinetic(parsed.params.animationType, parsed.params.duration || 2);
      }
      break;

    case "none":
      // No scene changes
      break;

    default:
      console.warn("Unhandled action:", parsed.action);
      break;
  }
}

function animateKinetic(type, duration) {
  if (!textMesh) {
    console.warn("No textMesh to animate!");
    return;
  }

  const startTime = performance.now();
  const endTime = startTime + duration * 1000;
  const originalY = textMesh.position.y;
  const amplitude = 1; // how high the text bounces

  function bounceAnimation() {
    const now = performance.now();
    const t = (now - startTime) / (duration * 1000);

    if (type === "bounce") {
      // Simple sine wave bounce
      const offset = Math.sin(t * Math.PI * 2) * amplitude * (1 - t);
      textMesh.position.y = originalY + offset;
    }

    if (now < endTime) {
      requestAnimationFrame(bounceAnimation);
    } else {
      textMesh.position.y = originalY; // reset
    }
  }

  requestAnimationFrame(bounceAnimation);
}

// --- UI references ---
const chatBox = document.getElementById("chat-box");
const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("send");
const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generate");

// When user clicks "Render Text"
if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    if (!textInput) return;
    userText = textInput.value.trim();  // Save user text globally
    if (userText) {
      renderText(userText); // default color is #0077ff
    }
  });
}

// When user clicks "Send Prompt"
if (sendBtn) {
  sendBtn.addEventListener("click", async () => {
    if (!promptInput) return;
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    chatBox.innerHTML += `<p>You: ${prompt}</p>`;

    try {
      const response = await fetch("/api/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (data.response) {
        chatBox.innerHTML += `<p>AI: ${data.response}</p>`;
        processAIResponse(data.response);
      } else {
        chatBox.innerHTML += `<p>Error: ${data.error}</p>`;
      }
    } catch (error) {
      console.error("Error communicating with AI:", error);
      chatBox.innerHTML += `<p>Error: Failed to communicate with AI.</p>`;
    }
  });
}

initScene();
