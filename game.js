import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/XRControllerModelFactory.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09111d);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 5);

const player = new THREE.Group();
player.position.set(0, 0, 0);
player.add(camera);
scene.add(player);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const messageEl = document.getElementById('message');

let score = 0;
let timeLeft = 60;
let gameOver = false;

const ambient = new THREE.HemisphereLight(0xbfe3ff, 0x102030, 1.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(3, 6, 2);
dirLight.castShadow = true;
scene.add(dirLight);

// Arena floor
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(7, 64),
  new THREE.MeshStandardMaterial({
    color: 0x0e1b2a,
    roughness: 0.9,
    metalness: 0.2
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Outer ring
const arenaRing = new THREE.Mesh(
  new THREE.TorusGeometry(4.8, 0.06, 16, 120),
  new THREE.MeshStandardMaterial({
    color: 0x68d9ff,
    emissive: 0x2b6d8f,
    emissiveIntensity: 0.5
  })
);
arenaRing.rotation.x = Math.PI / 2;
arenaRing.position.y = 0.02;
scene.add(arenaRing);

// floating crystals
const crystalGeometry = new THREE.OctahedronGeometry(0.28, 0);
const crystalMaterial = new THREE.MeshStandardMaterial({
  color: 0x5feaff,
  emissive: 0x1a6d8f,
  emissiveIntensity: 1.1,
  roughness: 0.25,
  metalness: 0.45
});

const crystals = [];

function randomPositionInArena() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 1.5 + Math.random() * 3.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = 0.7 + Math.random() * 2.2;
  return new THREE.Vector3(x, y, z);
}

function spawnCrystal(crystal) {
  const position = randomPositionInArena();
  crystal.group.position.copy(position);
  crystal.baseY = position.y;
  crystal.group.visible = true;
  crystal.collected = false;
  crystal.group.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
}

function createCrystal() {
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(crystalGeometry, crystalMaterial.clone());
  mesh.castShadow = true;
  group.add(mesh);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x63e4ff,
      transparent: true,
      opacity: 0.15
    })
  );
  glow.scale.set(1.1, 1.8, 1.1);
  group.add(glow);

  scene.add(group);

  const crystal = {
    group,
    baseY: 1,
    collected: false,
    phase: Math.random() * Math.PI * 2,
    bobSpeed: 1 + Math.random() * 2,
    spinSpeed: 0.8 + Math.random() * 1.2
  };

  spawnCrystal(crystal);
  crystals.push(crystal);
}

for (let i = 0; i < 9; i++) {
  createCrystal();
}

function updateHud() {
  scoreEl.textContent = String(score);
  timeEl.textContent = String(Math.max(0, Math.ceil(timeLeft)));
}

function endGame() {
  gameOver = true;
  messageEl.textContent = 'Time up! You scored ' + score + ' points. Refresh to play again.';
}

function updateCrystals(delta, elapsed) {
  for (const crystal of crystals) {
    if (crystal.collected) continue;

    crystal.group.rotation.y += delta * crystal.spinSpeed;
    crystal.group.position.y =
      crystal.baseY + Math.sin(elapsed * crystal.bobSpeed + crystal.phase) * 0.18;
  }
}

function assignCrystalToRespawn(crystal) {
  setTimeout(() => {
    if (!crystal.collected) return;
    crystal.collected = false;
    spawnCrystal(crystal);
  }, 900);
}

function collectCrystal(crystal) {
  if (crystal.collected) return;

  crystal.collected = true;
  crystal.group.visible = false;
  score += 10;
  updateHud();

  assignCrystalToRespawn(crystal);
}

// Desktop controls
const keys = {};
window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

function updateDesktopMovement(delta) {
  if (gameOver) return;

  let moveX = 0;
  let moveZ = 0;

  if (keys['w']) moveZ -= 1;
  if (keys['s']) moveZ += 1;
  if (keys['a']) moveX -= 1;
  if (keys['d']) moveX += 1;

  if (moveX !== 0 || moveZ !== 0) {
    const length = Math.hypot(moveX, moveZ) || 1;
    const speed = 2.4;

    player.position.x += (moveX / length) * speed * delta;
    player.position.z += (moveZ / length) * speed * delta;

    player.position.x = THREE.MathUtils.clamp(player.position.x, -4.3, 4.3);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -4.3, 4.3);
  }
}

// VR controller setup
const controllerModelFactory = new XRControllerModelFactory();

const controllers = [];

for (let i = 0; i < 2; i++) {
  const controller = renderer.xr.getController(i);
  controller.userData.isSelecting = false;
  scene.add(controller);

  const grip = renderer.xr.getControllerGrip(i);
  const model = controllerModelFactory.createControllerModel(grip);
  grip.add(model);
  scene.add(grip);

  controller.addEventListener('selectstart', () => {
    controller.userData.isSelecting = true;
  });

  controller.addEventListener('selectend', () => {
    controller.userData.isSelecting = false;
  });

  controllers.push({ controller, grip });
}

function checkVRCollection() {
  if (gameOver) return;

  for (const { controller } of controllers) {
    if (!controller.userData.isSelecting) continue;

    const controllerPos = new THREE.Vector3();
    controller.getWorldPosition(controllerPos);

    for (const crystal of crystals) {
      if (crystal.collected) continue;

      const crystalPos = crystal.group.getWorldPosition(new THREE.Vector3());
      const distance = controllerPos.distanceTo(crystalPos);

      if (distance < 0.45) {
        collectCrystal(crystal);
      }
    }
  }
}

// Render loop
const clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  if (!gameOver) {
    timeLeft -= delta;
    updateHud();

    if (timeLeft <= 0) {
      endGame();
    }
  }

  updateDesktopMovement(delta);
  updateCrystals(delta, elapsed);
  checkVRCollection();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});