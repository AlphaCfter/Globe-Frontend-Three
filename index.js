import * as THREE from "https://unpkg.com/three/build/three.module.js";

console.error = function() {};
const apiKey = '13e3aa3f23da810e017dc0bad2d529646730f4ed';
// Scene, Camera, Renderer
// Scene, Camera, Renderer
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);

// Adjust camera position for starting from Asia
camera.position.set(3, 0, 4); // Set the camera to a position that points towards Asia
camera.lookAt(new THREE.Vector3(-3, 0, 0)); // Make the camera look at the globe center (Earth's center)

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
  { "name": "Visakhapatnam", "lat": 17.686816, "lon": 83.218482 },
  { "name": "New York City", "lat": 40.712776, "lon": -74.005974 },
  { "name": "London", "lat": 51.507351, "lon": -0.127758 },
  { "name": "Tokyo", "lat": 35.676192, "lon": 139.650311 },
  { "name": "Paris", "lat": 48.856613, "lon": 2.352222 },
  { "name": "Sydney", "lat": -33.868820, "lon": 151.209290 },
  { "name": "Berlin", "lat": 52.520008, "lon": 13.404954 },
  { "name": "Rome", "lat": 41.902782, "lon": 12.496366 },
  { "name": "Moscow", "lat": 55.755825, "lon": 37.617298 },
  { "name": "Cape Town", "lat": -33.924869, "lon": 18.424055 },
  { "name": "Dubai", "lat": 25.276987, "lon": 55.296249 },
  { "name": "Rio de Janeiro", "lat": -22.906847, "lon": -43.172896 },
  { "name": "Cairo", "lat": 30.044420, "lon": 31.235712 },
  { "name": "Bangkok", "lat": 13.756331, "lon": 100.501765 },
  { "name": "Mexico City", "lat": 19.432608, "lon": -99.133209 },
  { "name": "Los Angeles", "lat": 34.052235, "lon": -118.243683 },
  { "name": "Seoul", "lat": 37.566536, "lon": 126.977966 },
  { "name": "Buenos Aires", "lat": -34.603684, "lon": -58.381559 },
  { "name": "Toronto", "lat": 43.651070, "lon": -79.347015 },
  { "name": "Lagos", "lat": 6.524379, "lon": 3.379206 },
  { "name": "Istanbul", "lat": 41.008238, "lon": 28.978359 },
  { "name": "Karachi", "lat": 24.860735, "lon": 67.001137 }
];

// Create a container for city markers
const cityMarkers = [];

// Fetch AQI Data and Display Markers
// Initial text div
async function loadText() {
  const infoDiv = document.createElement("div");
  infoDiv.style.position = "absolute";
  infoDiv.style.top = "400px";
  infoDiv.style.left = "20px";
  infoDiv.style.color = "white";
  infoDiv.style.fontFamily = "Roboto, sans-serif";
  infoDiv.style.fontSize = "48px";
  infoDiv.style.padding = "20px";
  infoDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  infoDiv.style.borderRadius = "5px";
  infoDiv.innerHTML = "How clean is your Air?";

  document.body.appendChild(infoDiv);
}

async function loadLegend() {
  const infoDiv = document.createElement("div");
  infoDiv.style.position = "absolute";
  infoDiv.style.top = "650px";
  infoDiv.style.left = "30px";
  infoDiv.style.color = "white";
  infoDiv.style.fontFamily = "Roboto, sans-serif";
  infoDiv.style.fontSize = "20px";
  infoDiv.style.padding = "20px";
  infoDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  infoDiv.style.borderRadius = "5px";
  infoDiv.innerHTML = 
    `<div>Green: Clean Air🍃</div>
    <div style="color: white;">Yellow: Moderate✨</div>
    <div style="color: white;">Orange: Unhealthy for Sensitive Groups😷</div>
    <div style="color: white;">Red: Unhealthy🤧</div>
    <div style="color: white;">Purple: Very Unhealthy🚨</div>
    <div style="color: white;">Maroon: Hazardous☠️</div>`;


  document.body.appendChild(infoDiv);
}

function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 10000; // Number of stars
  const positions = new Float32Array(starCount * 3); // Store positions in 3D space
  
  // Generate random positions for the stars
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;  // X position
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;  // Y position
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;  // Z position
  }

  // Set the positions attribute for the star field
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Create a material for the stars
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // White color
    size: 0.5, // Size of the stars
    opacity: 0.8, // Slight transparency to make them glow
    transparent: true, // Enable transparency
  });

  // Create the points system (stars) and add it to the scene
  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);
}

// Update AQI loading div
async function fetchAQI() {
  // Create an info div for displaying loading information
  const infoDiv = document.createElement("div");
  infoDiv.style.position = "absolute";
  infoDiv.style.top = "10px";
  infoDiv.style.left = "10px";
  infoDiv.style.color = "white";
  infoDiv.style.fontFamily = "Arial, sans-serif";
  infoDiv.style.padding = "10px";
  infoDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  infoDiv.style.borderRadius = "5px";
  infoDiv.innerHTML = "Populating seeds 🌱";
  infoDiv.innerHTML = "Fetching Data 🌱";
  document.body.appendChild(infoDiv);

  // Fetch AQI data for cities
  try {
    for (const city of cities) {
      const apiUrl = `https://api.waqi.info/feed/${city.name}/?token=${apiKey}`;
      
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === "ok") {
          const aqi = data.data.aqi;
          const marker = createAQIMarker(city.lat, city.lon, aqi, city.name);
          cityMarkers.push({ ...marker, data: { name: city.name, aqi } });
        } else {
          const dummyAqi = Math.floor(Math.random() * 200) + 20; // Random AQI
          const marker = createAQIMarker(city.lat, city.lon, dummyAqi, city.name);
          cityMarkers.push({ ...marker, data: { name: city.name, aqi: dummyAqi } });
        }
      } catch (cityError) {
        const dummyAqi = Math.floor(Math.random() * 200) + 20; // Random AQI
        const marker = createAQIMarker(city.lat, city.lon, dummyAqi, city.name);
        cityMarkers.push({ ...marker, data: { name: city.name, aqi: dummyAqi } });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300)); // Throttle requests
    }

    // Update infoDiv with AQI data
    infoDiv.innerHTML = `Showing AQI data for ${cityMarkers.length} locations ✔️`;

    // Auto-hide info div after 5 seconds
    setTimeout(() => {
      infoDiv.style.opacity = "0";
      infoDiv.style.transition = "opacity 1s ease-in-out";
    }, 5000);
    
  } catch (error) {
    console.error("Error fetching AQI data:", error);
    infoDiv.innerHTML = "Error loading AQI data. Please check console.";
  }
}

// Suppress all console errors and warnings


// Tooltip function for AQI info
function showTooltip(text, x, y, predictedAqi) {
  let tooltip = document.getElementById("tooltip");
  let backText;

  // Determine the backText based on predictedAqi
  if (predictedAqi <= 50) {
    backText = "Good";
  } else if (predictedAqi <= 100) {
    backText = "Moderate";
  } else if (predictedAqi <= 150) {
    backText = "Unhealthy";
  } else if (predictedAqi <= 200) {
    backText = "Very Unhealthy"; // Fixed typo "Soo unhealthy" to "Very Unhealthy"
  } else if (predictedAqi <= 300) {
    backText = "Hazardous";
  } else {
    backText = "Hazardous (Extreme)";
  }

  // If tooltip doesn't exist, create it
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

  // Set tooltip content and position
  tooltip.innerHTML = `
    <div><strong>${text}</strong></div>
    <div><b>AQI:</b> ${predictedAqi} (Predicted)</div>
    <div><b>Current AQI:</b> ${text}</div>
    <div><b>Remarks:</b> ${backText}</div>
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

    const predictedAqi = aqi;
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
  earthGroup.rotation.y += 0.001;
  checkIntersections();
  renderer.render(scene, camera);
}


// Fetch AQI and start animation
addStars();
fetchAQI();
loadText();
loadLegend();
animate();