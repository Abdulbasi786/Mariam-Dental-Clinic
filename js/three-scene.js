import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a3d62);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace; // Modern color space setting
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Enhances lighting contrast
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

// Setup PMREM and Studio Environment for realistic reflections on enamel
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// 2. Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 3. Define Glossy Material for Tooth Enamel
const toothMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1
});

// 4. Load the Tooth 3D Asset
let toothMesh;
const loader = new GLTFLoader();

loader.load('path/to/dental_tooth_model.gltf', (gltf) => {
  toothMesh = gltf.scene;

  toothMesh.traverse((child) => {
    if (child.isMesh) {
      child.material = toothMaterial;
    }
  });

  scene.add(toothMesh);
}, undefined, (error) => {
  console.error('An error occurred loading the model:', error);
});

// 5. Mouse Interaction Tracking
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) - 0.5;
  mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// 6. Animation Loop with Parallax & Rotation
function animate() {
  requestAnimationFrame(animate);

  if (toothMesh) {
    // Continuous passive rotation
    toothMesh.rotation.y += 0.008;

    // Smooth mouse parallax damping
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    toothMesh.rotation.y += (targetX - toothMesh.rotation.y) * 0.05;
    toothMesh.rotation.x += (targetY - toothMesh.x) * 0.05;
  }

  renderer.render(scene, camera);
}
animate();

// Handle responsive resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});