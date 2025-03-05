import * as THREE from "https://unpkg.com/three/build/three.module.js";

// Scene, Camera, Renderer
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Adjusted Camera - Closer and Wider FOV
const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
camera.position.set(0, 0, 3.5); // Initial camera position

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Load Textures
const loader = new THREE.TextureLoader();

// Slightly larger geometry with more segments
const geometry = new THREE.SphereGeometry(1.2, 64, 64);

// Create Earth Group (Fixed Position)
const earthGroup = new THREE.Group();
earthGroup.position.set(1, 0, 0); // Centered in the scene
earthGroup.rotation.y = 0.5; // Initial Y-axis rotation

// Earth Material
const material = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
  roughness: 0.7,
  metalness: 0.2
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Lights Material (City Lights)
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
  opacity: 0.5
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

// Clouds Material
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  alphaTest: 0.5,
  opacity: 0.6,
  roughness: 1.0,
  metalness: 0.0
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.02);
earthGroup.add(cloudsMesh);

scene.add(earthGroup);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Zoom and Rotation Variables
let isDragging = false;
let previousMouseX = 0;
let autoRotationSpeed = 0.002;
let manualRotationSpeed = 0;

// Zoom Settings
const minZoom = 1.5;
const maxZoom = 4;
let currentZoom = 2;

// Mouse Event Listeners
document.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMouseX = event.clientX;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  manualRotationSpeed = 0;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    let deltaX = event.clientX - previousMouseX;
    manualRotationSpeed = deltaX * 0.005;
    earthGroup.rotation.y += manualRotationSpeed;
    previousMouseX = event.clientX;
  }
});

// Zoom Functionality
// Zoom Functionality
document.addEventListener("wheel", (event) => {
  // Prevent page scrolling
  event.preventDefault();
  
  // Adjust zoom based on wheel delta
  currentZoom += event.deltaY * -0.001;
  
  // Clamp zoom between min and max values
  currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom));
  
  // Update camera position
  camera.position.z = currentZoom;
});

// Prevent default scroll behavior
document.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

// Animate Scene with Automatic Rotation
function animate() {
  requestAnimationFrame(animate);
  
  if (!isDragging) {
    earthGroup.rotation.y += autoRotationSpeed;
  }
  
  renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);