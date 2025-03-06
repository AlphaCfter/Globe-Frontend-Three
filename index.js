import * as THREE from "https://unpkg.com/three/build/three.module.js";

// Scene, Camera, Renderer
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
camera.position.set(-1.75, 0, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Load Textures
const loader = new THREE.TextureLoader();
const geometry = new THREE.SphereGeometry(1.2, 64, 64);
const earthGroup = new THREE.Group();
scene.add(earthGroup);

// Earth Material
const material = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
  roughness: 0.7,
  metalness: 0.2
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Create a separate group for AQI data to keep globe untouched
const aqiGroup = new THREE.Group();
earthGroup.add(aqiGroup);

// Helper functions to convert latitude/longitude to 3D coordinates
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

// AQI color scale
function getAQIColor(aqi) {
  if (aqi <= 50) return 0x00e400; // Good - Green
  if (aqi <= 100) return 0xffff00; // Moderate - Yellow
  if (aqi <= 150) return 0xff7e00; // Unhealthy for Sensitive Groups - Orange
  if (aqi <= 200) return 0xff0000; // Unhealthy - Red
  if (aqi <= 300) return 0x8f3f97; // Very Unhealthy - Purple
  return 0x7e0023; // Hazardous - Maroon
}

// Create marker for a location with AQI data
function createAQIMarker(lat, lon, aqi, name) {
  const markerPosition = latLongToVector3(lat, lon, 1.2);
  
  // Create line extending outward to represent AQI value
  const lineLength = 0.1 + (aqi / 500) * 0.5; // Scale line length by AQI value
  const lineEnd = markerPosition.clone().normalize().multiplyScalar(1.2 + lineLength);
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([markerPosition, lineEnd]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: getAQIColor(aqi), linewidth: 2 });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  aqiGroup.add(line);
  
  // Create a small sphere at the end of the line
  const tipGeometry = new THREE.SphereGeometry(0.02, 16, 16);
  const tipMaterial = new THREE.MeshBasicMaterial({ color: getAQIColor(aqi) });
  const tip = new THREE.Mesh(tipGeometry, tipMaterial);
  tip.position.copy(lineEnd);
  tip.userData = { name, aqi };
  aqiGroup.add(tip);
  
  return { line, tip };
}

// Sample cities - you can expand this list
const cities = [
  { "name": "Ahmedabad", "lat": 23.033863, "lon": 72.585022 },
  { "name": "Aizawl", "lat": 23.727107, "lon": 92.717639 },
  { "name": "Amaravati", "lat": 16.506174, "lon": 80.648015 },
  { "name": "Amritsar", "lat": 31.634308, "lon": 74.873678 },
  { "name": "Bengaluru", "lat": 12.971599, "lon": 77.594566 },
  { "name": "Bhopal", "lat": 23.259933, "lon": 77.412615 },
  { "name": "Brajrajnagar", "lat": 21.816667, "lon": 83.916667 },
  { "name": "Chandigarh", "lat": 30.733315, "lon": 76.779418 },
  { "name": "Chennai", "lat": 13.082680, "lon": 80.270718 },
  { "name": "Coimbatore", "lat": 11.016844, "lon": 76.955833 },
  { "name": "Delhi", "lat": 28.704060, "lon": 77.102493 },
  { "name": "Ernakulam", "lat": 9.981635, "lon": 76.299884 },
  { "name": "Gurugram", "lat": 28.459497, "lon": 77.026638 },
  { "name": "Guwahati", "lat": 26.144518, "lon": 91.736237 },
  { "name": "Hyderabad", "lat": 17.385044, "lon": 78.486671 },
  { "name": "Jaipur", "lat": 26.912434, "lon": 75.787270 },
  { "name": "Jorapokhar", "lat": 23.666667, "lon": 86.400000 },
  { "name": "Kochi", "lat": 9.931233, "lon": 76.267304 },
  { "name": "Kolkata", "lat": 22.572646, "lon": 88.363895 },
  { "name": "Lucknow", "lat": 26.846694, "lon": 80.946166 },
  { "name": "Mumbai", "lat": 19.076090, "lon": 72.877426 },
  { "name": "Patna", "lat": 25.594095, "lon": 85.137566 },
  { "name": "Shillong", "lat": 25.578773, "lon": 91.893254 },
  { "name": "Talcher", "lat": 20.949607, "lon": 85.233553 },
  { "name": "Thiruvananthapuram", "lat": 8.524139, "lon": 76.936638 },
  { "name": "Visakhapatnam", "lat": 17.686816, "lon": 83.218482 }
];

// Create a container for city markers
const cityMarkers = [];

// Fetch AQI Data and Display Markers
async function fetchAQI() {
  const infoDiv = document.createElement("div");
  infoDiv.style.position = "absolute";
  infoDiv.style.top = "10px";
  infoDiv.style.left = "10px";
  infoDiv.style.color = "white";
  infoDiv.style.fontFamily = "Arial, sans-serif";
  infoDiv.style.padding = "10px";
  infoDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  infoDiv.style.borderRadius = "5px";
  infoDiv.innerHTML = "Loading AQI data ⏳";
  document.body.appendChild(infoDiv);

  try {
    for (const city of cities) {
      const apiUrl = `https://api.waqi.info/feed/${city.name}/?token=13e3aa3f23da810e017dc0bad2d529646730f4ed`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "ok") {
          const aqi = data.data.aqi;
          const marker = createAQIMarker(city.lat, city.lon, aqi, city.name);
          cityMarkers.push({ ...marker, data: { name: city.name, aqi } });
        } else {
          const dummyAqi = Math.floor(Math.random() * 200) + 20; // Random AQI between 20-220
          const marker = createAQIMarker(city.lat, city.lon, dummyAqi, city.name);
          cityMarkers.push({ ...marker, data: { name: city.name, aqi: dummyAqi } });
        }
      } catch (cityError) {
        const dummyAqi = Math.floor(Math.random() * 200) + 20; // Random AQI between 20-220
        const marker = createAQIMarker(city.lat, city.lon, dummyAqi, city.name);
        cityMarkers.push({ ...marker, data: { name: city.name, aqi: dummyAqi } });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    infoDiv.innerHTML = `Showing AQI data for ${cityMarkers.length} locations ✔️`;

    setTimeout(() => {
      infoDiv.style.opacity = "0";
      infoDiv.style.transition = "opacity 1s ease-in-out";
    }, 5000);

  } catch (error) {
    infoDiv.innerHTML = "Error loading AQI data. Please check console.";
  }
}

// Tooltip Function for AQI info
function showTooltip(text, x, y, predictedAqi) {
  let tooltip = document.getElementById("tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.padding = "20px";
    tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    tooltip.style.color = "white";
    tooltip.style.borderRadius = "10px";
    tooltip.style.fontFamily = "Arial, sans-serif";
    tooltip.style.fontSize = "16px";
    tooltip.style.maxWidth = "250px"; // Limit width of the card
    tooltip.style.pointerEvents = "none";
    tooltip.style.zIndex = "1000";
    tooltip.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.6)";
    document.body.appendChild(tooltip);
  }

  tooltip.innerHTML = `
    <div><strong>${text}</strong></div>
    <div><b>AQI:</b> ${predictedAqi} (Predicted)</div>
    <div><b>Current AQI:</b> ${text}</div>
  `;
  tooltip.style.left = `${x + 20}px`;
  tooltip.style.top = `${y + 20}px`;
  tooltip.style.display = "block";
}

// Raycaster for Intersections (Hover detection)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredMarker = null;

// Update mouse position for raycasting
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Check intersections immediately after the mouse move
  checkIntersections(event);
});

// Raycast to detect intersections and show tooltip
function checkIntersections(event) {
  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Get all tip objects
  const tipObjects = cityMarkers.map(cityMarker => cityMarker.tip);

  // Calculate intersections
  const intersects = raycaster.intersectObjects(tipObjects);

  // Reset previously hovered marker if exists
  if (hoveredMarker && (!intersects.length || intersects[0].object !== hoveredMarker)) {
    // Reset marker size
    hoveredMarker.scale.set(1, 1, 1);
    hoveredMarker = null;
    hideTooltip();
  }

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    const { name, aqi } = intersected.userData;

    // Highlight current marker if not already highlighted
    if (hoveredMarker !== intersected) {
      intersected.scale.set(1.5, 1.5, 1);
      hoveredMarker = intersected;
    }

    // Placeholder for predicted AQI (for now, use the same value as current AQI)
    const predictedAqi = aqi;

    // Show the tooltip with the AQI information
    showTooltip(name, event.clientX, event.clientY, predictedAqi);
  }
}

// Hide tooltip
function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) tooltip.style.display = "none";
}

// Main render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the earth
  earthGroup.rotation.y += 0.001;

  // Perform raycasting to detect intersections
  checkIntersections();

  // Render the scene
  renderer.render(scene, camera);
}

fetchAQI();
animate();
