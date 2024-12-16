import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

let scene, camera, renderer, textMesh;

function initScene() {
  const container = document.getElementById("canvas-container");
  if (!container) {
    console.error("No element with ID 'canvas-container' found");
    return;
  }

  // Create Three.js scene
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

// This function parses the LLM's JSON response and updates the scene
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
        renderText("Custom AI text", parsed.params.color);
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
      }
      // Extend with other geometry types as needed
      break;

    case "rotateObject":
      if (textMesh && parsed.params) {
        textMesh.rotation.x += parsed.params.x || 0;
        textMesh.rotation.y += parsed.params.y || 0;
        textMesh.rotation.z += parsed.params.z || 0;
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

// --- UI references ---
const chatBox = document.getElementById("chat-box");
const promptInput = document.getElementById("promptInput");
const sendBtn = document.getElementById("send");
const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generate");

// Render user-defined text in the 3D scene
if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    if (!textInput) return;
    const text = textInput.value.trim();
    if (text) renderText(text);
  });
}

// Send the user's prompt to our /api/customize endpoint
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
        // Display LLM's raw text in chat
        chatBox.innerHTML += `<p>AI: ${data.response}</p>`;
        // Parse the JSON instructions and update the scene
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

// Initialize the Three.js scene
initScene();
