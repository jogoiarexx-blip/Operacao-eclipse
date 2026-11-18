import * as THREE from 'three';

// OPERAÇÃO ECLIPSE — protótipo jogável da Missão 01.
// A simulação (vida, inimigos, objetivos e checkpoints) é independente da apresentação 3D.

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const ui = {
  fps: $('fps-counter'),
  menu: $('main-menu'), briefing: $('mission-briefing'), pause: $('pause-screen'), death: $('death-screen'),
  complete: $('complete-screen'), info: $('info-modal'), hud: $('hud'), pointerHint: $('pointer-hint'),
  loading: $('loading-screen'), loadingFill: $('loading-fill'), loadingStatus: $('loading-status'),
  objective: $('objective-text'), health: $('health-value'), healthFill: $('health-fill'), ammo: $('ammo-current'),
  reserve: $('ammo-reserve'), reload: $('reload-label'), interact: $('interact-prompt'), toast: $('tutorial-toast'),
  toastTitle: $('toast-title'), toastText: $('toast-text'), radio: $('radio-subtitle'), radioText: $('radio-text'),
  hit: $('hit-marker'), damage: $('damage-flash'), crosshair: $('crosshair'), compass: $('compass-value')
};

const SAVE_KEY = 'operacao-eclipse-save-v1';
const SETTINGS_KEY = 'operacao-eclipse-settings-v1';
const defaults = { volume: 55, sensitivity: 1, difficulty: 'soldado', quality: 'equilibrado', fov: 78, showFPS: false };
let settings = { ...defaults, ...readJSON(SETTINGS_KEY, {}) };
let savedGame = readJSON(SAVE_KEY, null);
let state = 'menu';
let pendingContinue = false;
let pointerLocked = false;
let intentionalUnlock = false;
let yaw = 0;
let pitch = 0;
let aiming = false;
let isCrouching = false;
let isReloading = false;
let reloadTime = 0;
let fireCooldown = 0;
let jumpVelocity = 0;
let grounded = true;
let damageFlashTime = 0;
let toastTime = 0;
let radioTime = 0;
let hitTime = 0;
let fpsFrames = 0;
let fpsTimer = 0;
let fpsValue = 0;
let elapsedMission = 0;
let shotsFired = 0;
let shotsHit = 0;
let kills = 0;
let health = 100;
let ammo = 8;
let reserveAmmo = 40;
let missionPhase = 0;
let operatorRescued = false;
let ambushTriggered = false;
let missionComplete = false;
let activeInteractable = null;
let checkpoint = { x: 0, z: 28, health: 100, ammo: 8, reserve: 40, phase: 0, operatorRescued: false };
let enemies = [];
let pickups = [];
let colliders = [];
let effects = [];
let keys = Object.create(null);
let lastToastKind = '';
let infoReturnScreen = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9a9b8e);
scene.fog = new THREE.FogExp2(0x85877d, 0.0095);
const camera = new THREE.PerspectiveCamera(settings.fov, window.innerWidth / window.innerHeight, 0.08, 180);
camera.rotation.order = 'YXZ';
camera.position.set(15, 10, 22);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: settings.quality !== 'baixo', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.quality === 'baixo' ? 1 : 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = settings.quality === 'alto';
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);
const worldUp = new THREE.Vector3(0, 1, 0);
const player = { position: new THREE.Vector3(0, 1.7, 28), velocity: new THREE.Vector3(), radius: 0.42, speed: 5.0 };
let weaponGroup;
let muzzleFlash;
let rifleSway = 0;
let recoil = 0;
let audioContext = null;
let noiseBuffer = null;
let worldBuilt = false;

function readJSON(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento pode estar indisponível */ }
}
function showScreen(screen) {
  [ui.menu, ui.briefing, ui.pause, ui.death, ui.complete, ui.info].forEach(el => el.classList.remove('active'));
  if (screen) screen.classList.add('active');
}
function updateContinueButton() {
  const canContinue = !!savedGame && savedGame.version === 1 && savedGame.mission === '01';
  $('continue-btn').disabled = !canContinue;
  $('continue-btn').classList.toggle('primary', canContinue);
  $('new-game-btn').classList.toggle('primary', !canContinue);
}
function saveSettings() { writeJSON(SETTINGS_KEY, settings); }
function saveGame() {
  savedGame = {
    version: 1, mission: '01', checkpoint: { ...checkpoint }, kills, shotsFired, shotsHit,
    elapsedMission, difficulty: settings.difficulty, operatorRescued, ambushTriggered, missionPhase
  };
  writeJSON(SAVE_KEY, savedGame);
  updateContinueButton();
}
function clearSave() { savedGame = null; try { localStorage.removeItem(SAVE_KEY); } catch {} updateContinueButton(); }

// ---------- Áudio sintetizado: não depende de arquivos externos. ----------
function initAudio() {
  if (audioContext) { if (audioContext.state === 'suspended') audioContext.resume(); return; }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audioContext = new AudioCtx();
  const length = audioContext.sampleRate * 0.35;
  noiseBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
}
function playShotSound() {
  if (!audioContext || settings.volume <= 0) return;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain(); gain.gain.value = settings.volume / 100 * 0.42; gain.connect(audioContext.destination);
  const noise = audioContext.createBufferSource(); noise.buffer = noiseBuffer;
  const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(1700, now); filter.frequency.exponentialRampToValueAtTime(180, now + .16);
  const env = audioContext.createGain(); env.gain.setValueAtTime(.85, now); env.gain.exponentialRampToValueAtTime(.001, now + .22);
  noise.connect(filter); filter.connect(env); env.connect(gain); noise.start(now); noise.stop(now + .23);
  const osc = audioContext.createOscillator(); const og = audioContext.createGain(); osc.type = 'triangle'; osc.frequency.setValueAtTime(105, now); osc.frequency.exponentialRampToValueAtTime(38, now + .12);
  og.gain.setValueAtTime(.35, now); og.gain.exponentialRampToValueAtTime(.001, now + .13); osc.connect(og); og.connect(gain); osc.start(now); osc.stop(now + .14);
}
function playBeep(freq = 520, duration = .12) {
  if (!audioContext || settings.volume <= 0) return;
  const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
  osc.type = 'sine'; osc.frequency.value = freq; gain.gain.value = settings.volume / 100 * .08;
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration); osc.stop(audioContext.currentTime + duration);
}

// ---------- Construção do cenário. ----------
const mats = {};
function mat(name, color, roughness = 0.9, metalness = 0) {
  if (!mats[name]) mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return mats[name];
}
function addMesh(geometry, material, parent = scene, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
}
function addBox(parent, x, y, z, sx, sy, sz, material, rotY = 0) {
  const mesh = addMesh(new THREE.BoxGeometry(sx, sy, sz), material, parent, x, y, z); mesh.rotation.y = rotY; return mesh;
}
function addCylinder(parent, x, y, z, rt, rb, h, material, segments = 8, rotX = 0, rotZ = 0) {
  const mesh = addMesh(new THREE.CylinderGeometry(rt, rb, h, segments), material, parent, x, y, z); mesh.rotation.x = rotX; mesh.rotation.z = rotZ; return mesh;
}
function addCollider(x, z, r) { colliders.push({ x, z, r }); }
function addGroundPatch(x, z, sx, sz, color, opacity = 1) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: opacity < 1, opacity });
  const p = addMesh(new THREE.CircleGeometry(1, 12), m, scene, x, .035, z); p.rotation.x = -Math.PI / 2; p.scale.set(sx, sz, 1); return p;
}
function addTree(x, z, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); scene.add(g);
  addCylinder(g, 0, 1.25, 0, .22, .32, 2.5, mat('bark', 0x37352b), 6);
  const green = [0x394237, 0x46503d, 0x343d34][Math.floor(Math.random() * 3)];
  for (let i = 0; i < 3; i++) {
    const crown = addMesh(new THREE.ConeGeometry(1.5 - i * .23, 2.2, 7), mat(`foliage${green}`, green), g, 0, 3.1 + i * .95, 0);
    crown.rotation.y = i * .7;
  }
  addCollider(x, z, .72 * scale);
  return g;
}
function addRock(x, z, scale = 1) {
  const rock = addMesh(new THREE.DodecahedronGeometry(1, 0), mat('rock', 0x55564d), scene, x, .45 * scale, z);
  rock.scale.set(1.3 * scale, .65 * scale, .9 * scale); rock.rotation.set(Math.random(), Math.random(), Math.random());
  addCollider(x, z, 1.05 * scale);
}
function makeTruck(x, z, rotation = 0, destroyed = true) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotation; scene.add(g);
  const olive = mat('truckOlive', destroyed ? 0x3e463a : 0x555b48);
  const metal = mat('truckMetal', 0x292d2b, .7, .3);
  const glass = new THREE.MeshStandardMaterial({ color: 0x171f20, roughness: .25, metalness: .2 });
  addBox(g, 0, .95, 0, 2.45, .55, 5.1, olive);
  addBox(g, 0, 1.55, -1.45, 2.3, 1.15, 1.75, olive);
  addBox(g, 0, 2.02, -1.45, 2.05, .58, 1.55, glass);
  addBox(g, 0, 1.75, 1.15, 2.2, 1.1, 2.5, olive);
  addBox(g, 0, 2.32, 1.15, 2.2, .12, 2.5, mat('canvas', 0x4c5143));
  for (const side of [-1, 1]) for (const zz of [-1.7, 1.65]) {
    const wheel = addCylinder(g, side * 1.25, .55, zz, .48, .48, .28, mat('rubber', 0x171918), 10, 0, Math.PI / 2);
    wheel.rotation.z = Math.PI / 2;
    addCylinder(g, side * 1.405, .55, zz, .19, .19, .03, metal, 8, 0, Math.PI / 2);
  }
  addBox(g, -1.25, 1.4, .2, .12, .8, .9, metal, -.1);
  if (destroyed) {
    const debris = addBox(g, .3, 2.25, -1.1, .22, .1, 1.6, metal, .5); debris.rotation.z = .22;
    addBox(g, -.6, 1.65, 2.2, .8, .2, .4, mat('wood', 0x514637), .5);
    const fireMat = new THREE.MeshBasicMaterial({ color: 0x9e4928, transparent: true, opacity: .28 });
    const ember = addMesh(new THREE.SphereGeometry(.6, 7, 6), fireMat, g, .8, 1.05, -1.2); ember.scale.set(1.2, .45, 1.3);
  }
  addCollider(x, z, 3.35);
  return g;
}
function makeSandbagLine(x, z, count = 5, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  for (let i = 0; i < count; i++) {
    const bag = addMesh(new THREE.BoxGeometry(1.1, .42, .55), mat('sandbag', 0x77715b), g, (i - (count - 1) / 2) * .95, .22, 0);
    bag.rotation.y = (i % 2) * .07; bag.rotation.z = (i % 2 ? .025 : -.025);
  }
  addCollider(x, z, count * .46 + .5);
}
function makeTelegraphPole(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  addCylinder(g, 0, 3.2, 0, .13, .17, 6.4, mat('pole', 0x39372d), 6);
  addBox(g, 0, 5.5, 0, 2.4, .12, .12, mat('pole', 0x39372d));
  for (const dx of [-.8, 0, .8]) addCylinder(g, dx, 5.25, 0, .045, .045, .45, mat('pole', 0x39372d), 5);
}
function makeRuinedHouse(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const stone = mat('stone', 0x6b685d); const dark = mat('darkStone', 0x3b3d37);
  addBox(g, 0, 1.5, 0, 8, 3, .55, stone);
  addBox(g, -3.7, 1.5, 2.7, .55, 3, 5.4, stone);
  addBox(g, 3.7, 1.1, 2.6, .55, 2.2, 5.1, stone);
  addBox(g, -1.2, 2.9, 2.4, 3.4, .35, 4.8, dark, -.15);
  addBox(g, 2.5, 2.4, -1.3, 2.5, .3, 3.1, dark, .3);
  addBox(g, 0, .35, 5.1, 5, .7, .4, dark);
  addCollider(x, z + 2, 4.6);
}
function makeOutpost() {
  const g = new THREE.Group(); g.position.set(0, 0, -96); scene.add(g);
  const concrete = mat('outpostConcrete', 0x555950); const olive = mat('outpostOlive', 0x42483c);
  addBox(g, -7, 2.2, 0, 1.3, 4.4, 1.2, concrete);
  addBox(g, 7, 2.2, 0, 1.3, 4.4, 1.2, concrete);
  addBox(g, 0, 4.25, 0, 14.7, .55, 1.2, concrete);
  addBox(g, 0, 1.5, -.2, 12.5, 2.8, .25, olive);
  const gate = new THREE.Group(); gate.position.set(0, 1.35, -.1); g.add(gate);
  for (let i = -5; i <= 5; i++) addBox(gate, i * 1.05, 0, 0, .12, 2.7, .22, mat('gateMetal', 0x252a26, .6, .35));
  addBox(gate, 0, 1.3, 0, 11.1, .15, .25, mat('gateMetal', 0x252a26, .6, .35));
  gate.userData.isGate = true; g.userData.gate = gate; outpostGate = gate;
  addBox(g, 0, 2.3, -8, 11, 4.6, 1, concrete);
  addBox(g, 0, 4.7, -8, 11.5, .4, 1.4, olive);
  addCollider(-7, -96, 1.2); addCollider(7, -96, 1.2);
}
let outpostGate = null;
function createSmoke(x, y, z) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const ctx = c.getContext('2d'); const grad = ctx.createRadialGradient(32, 32, 3, 32, 32, 30);
  grad.addColorStop(0, 'rgba(54,55,50,.42)'); grad.addColorStop(.5, 'rgba(65,66,59,.2)'); grad.addColorStop(1, 'rgba(65,66,59,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c); const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.position.set(x, y, z); sprite.scale.set(3.5, 4.2, 1); scene.add(sprite);
  effects.push({ type: 'smoke', object: sprite, life: 9999, baseY: y, phase: Math.random() * 6 });
}
function createDust() {
  const count = settings.quality === 'baixo' ? 65 : 115;
  const geo = new THREE.BufferGeometry(); const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { positions[i * 3] = (Math.random() - .5) * 50; positions[i * 3 + 1] = Math.random() * 8 + .2; positions[i * 3 + 2] = -Math.random() * 115 + 30; }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xc6b99b, size: .055, transparent: true, opacity: .34, sizeAttenuation: true }));
  scene.add(points); dustField = points;
}
let dustField = null;
function buildWorld() {
  if (worldBuilt) return;
  worldBuilt = true;
  scene.add(new THREE.HemisphereLight(0xc1c4b5, 0x36372e, 1.2));
  const sun = new THREE.DirectionalLight(0xffd7a0, 2.1); sun.position.set(-28, 42, 22); sun.castShadow = settings.quality === 'alto';
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -45; sun.shadow.camera.right = 45; sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45; scene.add(sun);
  const warm = new THREE.PointLight(0xb87543, 13, 25, 2); warm.position.set(-5, 4, -24); scene.add(warm);
  addMesh(new THREE.PlaneGeometry(190, 190), mat('ground', 0x414439), scene, 0, -.22, -32).rotation.x = -Math.PI / 2;
  addMesh(new THREE.PlaneGeometry(9, 145), mat('road', 0x48483e), scene, 0, -.12, -35).rotation.x = -Math.PI / 2;
  // Ombros de terra e sulcos na estrada.
  addMesh(new THREE.PlaneGeometry(5, 145), mat('shoulder', 0x514d3e), scene, -6.7, -.13, -35).rotation.x = -Math.PI / 2;
  addMesh(new THREE.PlaneGeometry(5, 145), mat('shoulder', 0x514d3e), scene, 6.7, -.13, -35).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 28; i++) {
    const z = 22 - i * 4.2;
    addGroundPatch((Math.random() - .5) * 5, z, .2 + Math.random() * .8, .12 + Math.random() * .3, i % 3 ? 0x363a32 : 0x5c5747, .75);
  }
  // Colinas de fundo e silhueta do vale.
  for (let i = 0; i < 13; i++) {
    const side = i % 2 ? -1 : 1; const x = side * (23 + Math.random() * 22); const z = -8 - Math.random() * 105;
    const hill = addMesh(new THREE.ConeGeometry(9 + Math.random() * 9, 18 + Math.random() * 18, 7), mat('hill', i % 2 ? 0x505548 : 0x5b5c4f), scene, x, 4, z);
    hill.rotation.z = (Math.random() - .5) * .2;
  }
  const treePositions = [
    [-10, 15, 1.2], [11, 13, 1.25], [-13, 1, 1.5], [14, -4, 1.2], [-12, -13, 1.1], [12, -18, 1.3],
    [-16, -29, 1.5], [16, -30, 1.25], [-11, -43, 1.3], [13, -48, 1.4], [-18, -58, 1.2], [17, -63, 1.4],
    [-11, -73, 1.1], [12, -77, 1.2], [-16, -88, 1.35], [16, -88, 1.35], [-23, -15, 1.3], [24, -42, 1.3],
    [-24, -68, 1.4], [23, -91, 1.3]
  ];
  treePositions.forEach(([x, z, s]) => addTree(x, z, s));
  for (let i = 0; i < 18; i++) addRock((Math.random() < .5 ? -1 : 1) * (7 + Math.random() * 11), 18 - Math.random() * 110, .35 + Math.random() * .8);
  makeTelegraphPole(-9, 8); makeTelegraphPole(9, -48); makeTelegraphPole(-10, -80);
  // Comboio destruído: dois caminhões, destroços e cobertura.
  makeTruck(-2.8, -21, -.22, true);
  makeTruck(4.1, -32, .28, true);
  makeSandbagLine(-7.4, -17, 5, .1); makeSandbagLine(8, -38, 4, -.2);
  addBox(scene, -7.4, .55, -28, 1.1, 1.1, 1.1, mat('crate', 0x5a4c38), .2); addCollider(-7.4, -28, .9);
  addBox(scene, 7.5, .55, -24, 1.2, 1.1, 1.1, mat('crate', 0x554a39), -.3); addCollider(7.5, -24, .9);
  addBox(scene, 8.1, .45, -43, 1.4, .9, 1.2, mat('crate', 0x4e4839), .4); addCollider(8.1, -43, 1);
  makeRuinedHouse(-15, -55);
  // Abrigo de campanha junto ao operador.
  addBox(scene, 7.2, 1.45, -49, 4.8, .18, 4.5, mat('canvas', 0x494d40));
  addCylinder(scene, 5.1, 1.35, -49, .07, .07, 3.2, mat('pole', 0x4a463a), 6);
  addCylinder(scene, 9.3, 1.35, -49, .07, .07, 3.2, mat('pole', 0x4a463a), 6);
  makeOutpost();
  // Suprimentos posicionados antes da emboscada.
  createPickup('medkit', -7.8, -13.5, 'KIT MÉDICO');
  createPickup('ammo', 8.3, -28.8, 'MUNIÇÃO');
  createRadioOperator();
  createSmoke(-2, 3.2, -22); createSmoke(4, 3.8, -32); createDust();
}

function createPickup(type, x, z, label) {
  const g = new THREE.Group(); g.position.set(x, .5, z); scene.add(g);
  if (type === 'medkit') {
    addBox(g, 0, 0, 0, .75, .45, .55, mat('medkitWhite', 0xc9c5b1));
    addBox(g, 0, .235, 0, .16, .025, .58, mat('medkitRed', 0x8f4034));
    addBox(g, 0, .235, 0, .58, .025, .16, mat('medkitRed', 0x8f4034));
  } else {
    addBox(g, 0, 0, 0, .8, .6, .6, mat('ammoBox', 0x4b513d));
    addBox(g, 0, .32, 0, .82, .08, .62, mat('ammoMetal', 0x282d27, .6, .2));
    addBox(g, 0, .37, 0, .35, .03, .12, mat('ammoMark', 0xc2a46d));
  }
  const marker = addMesh(new THREE.TorusGeometry(.48, .035, 5, 18), new THREE.MeshBasicMaterial({ color: 0xc9aa70 }), g, 0, .65, 0); marker.rotation.x = Math.PI / 2;
  pickups.push({ type, label, group: g, used: false, x, z, marker });
}

let operatorGroup = null;
function createRadioOperator() {
  operatorGroup = new THREE.Group(); operatorGroup.position.set(4.7, 0, -45.5); scene.add(operatorGroup);
  const uniform = mat('operatorUniform', 0x4b5145); const skin = mat('operatorSkin', 0x9a8269); const dark = mat('operatorDark', 0x292c27);
  const torso = addMesh(new THREE.BoxGeometry(.65, .42, 1.05), uniform, operatorGroup, 0, .43, 0); torso.rotation.x = .05;
  addMesh(new THREE.SphereGeometry(.22, 8, 7), skin, operatorGroup, 0, .68, -.58);
  addBox(operatorGroup, 0, .84, -.58, .42, .15, .4, mat('helmet', 0x555c4a));
  const armL = addCylinder(operatorGroup, -.45, .35, -.15, .12, .13, .75, uniform, 7, Math.PI / 2, -.25); armL.rotation.z = -.2;
  const armR = addCylinder(operatorGroup, .45, .35, -.15, .12, .13, .75, uniform, 7, Math.PI / 2, .25); armR.rotation.z = .2;
  addBox(operatorGroup, -.18, .18, .55, .22, .18, .55, dark, -.15); addBox(operatorGroup, .2, .18, .55, .22, .18, .55, dark, .1);
  // Rádio de campanha ao lado do operador.
  const radio = new THREE.Group(); radio.position.set(.75, .2, .35); operatorGroup.add(radio);
  addBox(radio, 0, .22, 0, .4, .4, .28, mat('radioBody', 0x303631));
  addBox(radio, 0, .44, 0, .18, .04, .12, mat('radioDial', 0x9c8b63));
  addCylinder(radio, .12, .65, 0, .025, .025, .42, mat('radioAntenna', 0x272a27), 5);
  const glow = new THREE.PointLight(0xc08a50, 1.5, 3); glow.position.set(.75, .9, .35); operatorGroup.add(glow);
  const marker = new THREE.Group(); marker.position.set(0, 2.25, 0); operatorGroup.add(marker);
  const ring = addMesh(new THREE.TorusGeometry(.38, .035, 5, 18), new THREE.MeshBasicMaterial({ color: 0xd1ad6e }), marker); ring.rotation.x = Math.PI / 2;
  const stem = addMesh(new THREE.ConeGeometry(.13, .26, 5), new THREE.MeshBasicMaterial({ color: 0xd1ad6e }), marker, 0, -.3, 0); stem.rotation.x = Math.PI;
  operatorGroup.userData.marker = marker;
  addCollider(4.7, -45.5, .65);
}

function createWeapon() {
  weaponGroup = new THREE.Group(); camera.add(weaponGroup);
  const wood = mat('rifleWood', 0x58432f); const steel = mat('rifleSteel', 0x252a29, .45, .62); const dark = mat('rifleDark', 0x161a19, .55, .4);
  addBox(weaponGroup, .02, -.02, .06, .2, .18, .58, wood);
  addBox(weaponGroup, .02, .02, -.23, .18, .17, .42, steel);
  const barrel = addCylinder(weaponGroup, .02, .02, -.65, .035, .035, .72, steel, 8, Math.PI / 2);
  barrel.rotation.x = Math.PI / 2;
  addBox(weaponGroup, .02, -.12, -.36, .12, .12, .35, wood);
  addBox(weaponGroup, .02, .12, -.35, .08, .08, .16, dark);
  addBox(weaponGroup, .02, .18, -.56, .035, .11, .035, steel);
  addBox(weaponGroup, .02, .18, -.2, .035, .1, .035, steel);
  addBox(weaponGroup, -.09, -.11, -.22, .05, .17, .09, dark);
  weaponGroup.position.set(.38, -.34, -.58); weaponGroup.rotation.set(-.02, -.03, -.015); weaponGroup.visible = false;
  muzzleFlash = addMesh(new THREE.SphereGeometry(.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb45e, transparent: true, opacity: .95 }), weaponGroup, .02, .02, -.99);
  muzzleFlash.visible = false;
  const flashLight = new THREE.PointLight(0xffa04a, 0, 4); flashLight.position.set(.02, .02, -.85); weaponGroup.add(flashLight); muzzleFlash.userData.light = flashLight;
}

// ---------- Inimigos 3D low-poly: Errantes. ----------
function createEnemy(x, z, index) {
  const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
  const flesh = new THREE.MeshStandardMaterial({ color: 0x373b36, roughness: .96 });
  const torn = new THREE.MeshStandardMaterial({ color: 0x252b29, roughness: 1 });
  const violet = new THREE.MeshStandardMaterial({ color: 0x8f59c6, emissive: 0x54227d, emissiveIntensity: 1.7, roughness: .35 });
  const bone = new THREE.MeshStandardMaterial({ color: 0x777466, roughness: .9 });
  const body = addMesh(new THREE.CapsuleGeometry(.34, .72, 3, 6), flesh, group, 0, 1.05, 0); body.rotation.x = -.12;
  const chest = addMesh(new THREE.DodecahedronGeometry(.37, 0), torn, group, 0, 1.28, -.05); chest.scale.set(1, 1.25, .72);
  const head = addMesh(new THREE.SphereGeometry(.25, 7, 6), flesh, group, 0, 1.83, -.05); head.scale.set(.8, 1.15, .85); head.userData.part = 'head';
  for (const side of [-1, 1]) {
    const eye = addMesh(new THREE.SphereGeometry(.055, 6, 5), violet, group, side * .105, 1.88, -.27); eye.userData.part = 'eye';
    const arm = addCylinder(group, side * .42, 1.05, -.02, .12, .17, .88, flesh, 6, 0, side * -.17); arm.rotation.z = side * -.12;
    const hand = addMesh(new THREE.DodecahedronGeometry(.14, 0), bone, group, side * .48, .57, -.12);
    const leg = addCylinder(group, side * .18, .38, .02, .14, .19, .72, torn, 6, 0, side * .08);
    leg.rotation.z = side * .07;
  }
  const core = addMesh(new THREE.SphereGeometry(.12, 7, 6), violet, group, 0, 1.2, -.34);
  const aura = new THREE.PointLight(0x8b49b9, .8, 3.2); aura.position.set(0, 1.4, -.2); group.add(aura);
  const shadow = addMesh(new THREE.CircleGeometry(.65, 12), new THREE.MeshBasicMaterial({ color: 0x171a17, transparent: true, opacity: .35, depthWrite: false }), group, 0, .015, 0); shadow.rotation.x = -Math.PI / 2;
  const enemy = { group, x, z, health: enemyStats().health, speed: enemyStats().speed, damage: enemyStats().damage, attackTimer: .5 + index * .3, alive: true, hitMeshes: [body, chest, head, core], phase: Math.random() * 6, index, state: 'chase', lastAttack: 0 };
  [body, chest, head, core].forEach(m => m.userData.enemy = enemy);
  enemies.push(enemy);
  return enemy;
}
function enemyStats() {
  const stats = {
    recruta: { health: 45, speed: 1.35, damage: 8 },
    soldado: { health: 58, speed: 1.65, damage: 11 },
    veterano: { health: 72, speed: 1.9, damage: 15 },
    pesadelo: { health: 88, speed: 2.15, damage: 19 }
  };
  return stats[settings.difficulty] || stats.soldado;
}
function triggerAmbush() {
  if (ambushTriggered) return;
  ambushTriggered = true; missionPhase = 1;
  createEnemy(-9.2, -34.5, 0); createEnemy(10.0, -36.5, 1); createEnemy(-1.0, -49.0, 2);
  updateObjective('ELIMINE OS ERRANTES · 0 / 3');
  showToast('EMBOSCADA', 'Movimento à frente! Mire com o botão direito e dispare com o esquerdo.', 5.5);
  showRadio('Moretti: “Raul, contato desconhecido! Há movimento entre os veículos. Proteja-se!”', 5.2);
  playBeep(190, .3);
}

// ---------- Interface e objetivos. ----------
function updateObjective(text) { ui.objective.textContent = text; }
function updateHUD() {
  ui.health.textContent = Math.max(0, Math.round(health)); ui.healthFill.style.width = `${Math.max(0, health)}%`;
  ui.ammo.textContent = String(ammo).padStart(2, '0'); ui.reserve.textContent = String(reserveAmmo).padStart(2, '0');
  ui.compass.textContent = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'][Math.round((((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  ui.crosshair.classList.toggle('aimed', aiming);
}
function showToast(title, text, duration = 4) {
  ui.toastTitle.textContent = title; ui.toastText.textContent = text; ui.toast.classList.remove('hidden'); toastTime = duration; lastToastKind = title;
}
function showRadio(text, duration = 4) {
  ui.radioText.textContent = text; ui.radio.classList.remove('hidden'); radioTime = duration;
}
function updateInteractPrompt() {
  activeInteractable = null;
  if (operatorGroup && !operatorRescued) {
    const d = Math.hypot(player.position.x - operatorGroup.position.x, player.position.z - operatorGroup.position.z);
    if (d < 2.9 && missionPhase >= 2) activeInteractable = { type: 'operator', label: 'RESGATAR OPERADOR DE RÁDIO' };
  }
  for (const p of pickups) {
    if (p.used) continue;
    const d = Math.hypot(player.position.x - p.x, player.position.z - p.z);
    if (d < 2.2 && (!activeInteractable || d < 1.8)) activeInteractable = { type: 'pickup', pickup: p, label: `RECOLHER ${p.label}` };
  }
  if (activeInteractable) {
    ui.interact.classList.remove('hidden'); ui.interact.querySelector('span').textContent = activeInteractable.label;
  } else ui.interact.classList.add('hidden');
}
function interact() {
  if (!activeInteractable || state !== 'playing') return;
  if (activeInteractable.type === 'operator') {
    operatorRescued = true; missionPhase = 3; operatorGroup.visible = false;
    if (outpostGate) outpostGate.visible = false;
    updateObjective('ALCANCE O POSTO AVANÇADO');
    showToast('OPERADOR RESGATADO', 'O portão do posto avançado foi liberado. Siga pela estrada.', 5);
    showRadio('Operador: “Consegui manter o rádio funcionando... Eles vieram da encosta. Não eram soldados.”', 5.5);
    checkpoint = { x: player.position.x, z: player.position.z, health: Math.max(60, health), ammo, reserve: reserveAmmo, phase: 3, operatorRescued: true };
    health = Math.max(60, health); saveGame(); playBeep(740, .2);
  } else if (activeInteractable.type === 'pickup') {
    const p = activeInteractable.pickup; p.used = true; p.group.visible = false;
    if (p.type === 'medkit') { health = Math.min(100, health + 45); showToast('KIT MÉDICO', 'Condição física restaurada.', 2.5); }
    else { reserveAmmo = Math.min(80, reserveAmmo + 24); showToast('MUNIÇÃO RECOLHIDA', 'Cartuchos adicionados ao inventário.', 2.5); }
    updateHUD(); playBeep(650, .12);
  }
  activeInteractable = null; ui.interact.classList.add('hidden');
}
function showInfo(type) {
  infoReturnScreen = state === 'paused' ? ui.pause : ui.menu;
  const content = $('info-content');
  if (type === 'objectives') {
    content.innerHTML = `<div class="eyebrow"><i></i> ORDEM DE OPERAÇÃO</div><h3>OBJETIVOS E CONTROLES</h3><p><b>Missão:</b> Cinzas na Estrada.</p><ol><li>Avançar até o comboio destruído.</li><li>Eliminar os três Errantes da emboscada.</li><li>Localizar e resgatar o operador de rádio com E.</li><li>Alcançar o posto avançado pelo portão liberado.</li></ol><div class="control-list"><div><span>Mover</span><kbd>W A S D</kbd></div><div><span>Olhar</span><kbd>MOUSE</kbd></div><div><span>Disparar</span><kbd>CLIQUE ESQ.</kbd></div><div><span>Mirar</span><kbd>CLIQUE DIR.</kbd></div><div><span>Correr</span><kbd>SHIFT</kbd></div><div><span>Agachar</span><kbd>CTRL</kbd></div><div><span>Pular</span><kbd>ESPAÇO</kbd></div><div><span>Interagir</span><kbd>E</kbd></div><div><span>Recarregar</span><kbd>R</kbd></div><div><span>Pausar</span><kbd>ESC</kbd></div></div>`;
  } else if (type === 'arsenal') {
    content.innerHTML = `<div class="eyebrow"><i></i> ARQUIVO DE CAMPO</div><h3>ARSENAL / BESTIÁRIO</h3><p><b>Fuzil semiautomático:</b> arma inicial de médio alcance. Carregador de 8 cartuchos, recarga manual e boa precisão quando o jogador controla o recuo.</p><p><b>Errante:</b> criatura humanoide atraída por movimento e ruído. Avança em linha direta e ataca a curta distância. A cabeça e o núcleo violeta são pontos vulneráveis.</p><p><b>Equipamento:</b> kit médico e caixas de munição podem ser encontrados no cenário. O arsenal completo será liberado ao longo da campanha.</p>`;
  } else if (type === 'controls') {
    content.innerHTML = `<div class="eyebrow"><i></i> MANUAL DO OPERADOR</div><h3>CONTROLES</h3><div class="control-list"><div><span>Mover</span><kbd>W A S D</kbd></div><div><span>Olhar</span><kbd>MOUSE</kbd></div><div><span>Disparar</span><kbd>CLIQUE ESQ.</kbd></div><div><span>Mirar</span><kbd>CLIQUE DIR.</kbd></div><div><span>Correr</span><kbd>SHIFT</kbd></div><div><span>Agachar</span><kbd>CTRL</kbd></div><div><span>Pular</span><kbd>ESPAÇO</kbd></div><div><span>Interagir</span><kbd>E</kbd></div><div><span>Recarregar</span><kbd>R</kbd></div><div><span>Pausar</span><kbd>ESC</kbd></div></div><p>O navegador solicita captura do mouse ao iniciar. Pressione ESC para abrir a pausa e liberar o cursor.</p>`;
  } else if (type === 'credits') {
    content.innerHTML = `<div class="eyebrow"><i></i> REGISTRO DE PRODUÇÃO</div><h3>CRÉDITOS</h3><p><b>OPERAÇÃO ECLIPSE: A GUERRA DOS ESQUECIDOS</b></p><p>Projeto original de campanha FPS em Three.js. Protótipo de desenvolvimento — versão 0.1.0.</p><p>Direção: ficção alternativa de guerra sobrenatural. Personagens, unidade, eventos e Projeto Janus são elementos ficcionais.</p><p>Este protótipo utiliza geometria procedural e áudio sintetizado; modelos, animações e trilha definitivos ainda serão produzidos.</p>`;
  } else if (type === 'options') {
    content.innerHTML = `<div class="eyebrow"><i></i> CONFIGURAÇÃO DO SISTEMA</div><h3>OPÇÕES</h3>
      <div class="option-row"><label for="opt-volume">VOLUME GERAL</label><input id="opt-volume" type="range" min="0" max="100" value="${settings.volume}"></div>
      <div class="option-row"><label for="opt-sensitivity">SENSIBILIDADE DO MOUSE</label><input id="opt-sensitivity" type="range" min="0.3" max="2.5" step="0.1" value="${settings.sensitivity}"></div>
      <div class="option-row"><label for="opt-fov">CAMPO DE VISÃO · FOV</label><input id="opt-fov" type="range" min="70" max="100" value="${settings.fov}"></div>
      <div class="option-row"><label for="opt-quality">QUALIDADE GRÁFICA</label><select id="opt-quality"><option value="baixo" ${settings.quality === 'baixo' ? 'selected' : ''}>Baixo</option><option value="equilibrado" ${settings.quality === 'equilibrado' ? 'selected' : ''}>Equilibrado</option><option value="alto" ${settings.quality === 'alto' ? 'selected' : ''}>Alto</option></select></div>
      <div class="option-row"><label for="opt-difficulty">DIFICULDADE</label><select id="opt-difficulty"><option value="recruta" ${settings.difficulty === 'recruta' ? 'selected' : ''}>Recruta</option><option value="soldado" ${settings.difficulty === 'soldado' ? 'selected' : ''}>Soldado</option><option value="veterano" ${settings.difficulty === 'veterano' ? 'selected' : ''}>Veterano</option><option value="pesadelo" ${settings.difficulty === 'pesadelo' ? 'selected' : ''}>Pesadelo</option></select></div>
      <div class="option-row"><label for="opt-fps">EXIBIR FPS</label><input id="opt-fps" type="checkbox" ${settings.showFPS ? 'checked' : ''}></div>
      <p>As opções são salvas neste navegador. Alterações de qualidade são aplicadas imediatamente; a dificuldade afeta inimigos criados em uma nova tentativa.</p>`;
    setTimeout(() => {
      $('opt-volume')?.addEventListener('input', e => { settings.volume = Number(e.target.value); saveSettings(); });
      $('opt-sensitivity')?.addEventListener('input', e => { settings.sensitivity = Number(e.target.value); saveSettings(); });
      $('opt-fov')?.addEventListener('input', e => { settings.fov = Number(e.target.value); camera.fov = settings.fov; camera.updateProjectionMatrix(); saveSettings(); });
      $('opt-quality')?.addEventListener('change', e => { settings.quality = e.target.value; applyQuality(); saveSettings(); });
      $('opt-difficulty')?.addEventListener('change', e => { settings.difficulty = e.target.value; saveSettings(); });
      $('opt-fps')?.addEventListener('change', e => { settings.showFPS = e.target.checked; saveSettings(); });
    }, 0);
  }
  showScreen(ui.info);
}
function applyQuality() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.quality === 'baixo' ? 1 : 1.5));
  renderer.shadowMap.enabled = settings.quality === 'alto';
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Campanha, checkpoints e estados. ----------
function resetMission() {
  enemies.forEach(e => scene.remove(e.group)); enemies = [];
  kills = 0; shotsFired = 0; shotsHit = 0; elapsedMission = 0; health = 100; ammo = 8; reserveAmmo = 40;
  missionPhase = 0; operatorRescued = false; ambushTriggered = false; missionComplete = false;
  checkpoint = { x: 0, z: 28, health: 100, ammo: 8, reserve: 40, phase: 0, operatorRescued: false };
  if (operatorGroup) operatorGroup.visible = true;
  if (outpostGate) outpostGate.visible = true;
  pickups.forEach(p => { p.used = false; p.group.visible = true; });
  player.position.set(0, 1.7, 28); yaw = 0; pitch = 0; camera.rotation.set(0, 0, 0); camera.position.copy(player.position);
  updateObjective('AVANCE ATÉ O COMBOIO DESTRUÍDO'); updateHUD(); saveGame();
}
function loadCheckpoint() {
  const cp = checkpoint || { x: 0, z: 28, health: 100, ammo: 8, reserve: 40, phase: 0, operatorRescued: false };
  player.position.set(cp.x, 1.7, cp.z); health = cp.health; ammo = cp.ammo; reserveAmmo = cp.reserve; kills = cp.phase >= 2 ? 3 : 0;
  operatorRescued = !!cp.operatorRescued; missionPhase = cp.phase || 0;
  if (operatorGroup) operatorGroup.visible = !operatorRescued;
  if (outpostGate) outpostGate.visible = !operatorRescued;
  enemies.forEach(e => scene.remove(e.group)); enemies = [];
  ambushTriggered = missionPhase >= 1 && missionPhase < 3;
  if (ambushTriggered && missionPhase < 2) { createEnemy(-9.2, -34.5, 0); createEnemy(10.0, -36.5, 1); createEnemy(-1.0, -49.0, 2); }
  if (missionPhase >= 2 && !operatorRescued) { /* o caminho de resgate permanece aberto */ }
  updateObjective(operatorRescued ? 'ALCANCE O POSTO AVANÇADO' : missionPhase >= 2 ? 'RESGATE O OPERADOR DE RÁDIO' : missionPhase === 1 ? 'ELIMINE OS ERRANTES' : 'AVANCE ATÉ O COMBOIO DESTRUÍDO');
  updateHUD();
}
function newCampaign() { clearSave(); pendingContinue = false; resetMission(); showScreen(ui.briefing); state = 'briefing'; }
function continueCampaign() {
  if (!savedGame) return;
  pendingContinue = true;
  checkpoint = { ...savedGame.checkpoint };
  kills = savedGame.kills || 0; shotsFired = savedGame.shotsFired || 0; shotsHit = savedGame.shotsHit || 0;
  elapsedMission = savedGame.elapsedMission || 0; settings.difficulty = savedGame.difficulty || settings.difficulty;
  missionPhase = savedGame.missionPhase || checkpoint.phase || 0; operatorRescued = !!savedGame.operatorRescued;
  ambushTriggered = !!savedGame.ambushTriggered;
  showScreen(ui.briefing); state = 'briefing';
}
function beginGameplay() {
  initAudio();
  if (pendingContinue) loadCheckpoint(); else resetMission();
  pendingContinue = false;
  state = 'playing'; showScreen(null); ui.hud.classList.remove('hidden'); weaponGroup.visible = true;
  camera.position.copy(player.position); camera.rotation.set(pitch, yaw, 0);
  try { canvas.requestPointerLock(); } catch { ui.pointerHint.classList.remove('hidden'); }
  showToast('OBJETIVO', 'Avance pela estrada até localizar o comboio destruído. WASD para mover, SHIFT para correr.', 6);
  showRadio('Moretti: “Raul, está ouvindo? O comboio parou de responder há seis minutos. Encontre o operador.”', 6);
  saveGame();
}
function pauseGame() {
  if (state !== 'playing') return;
  state = 'paused'; showScreen(ui.pause); ui.pointerHint.classList.add('hidden');
  intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
}
function resumeGame() {
  if (state !== 'paused') return;
  state = 'playing'; showScreen(null);
  try { canvas.requestPointerLock(); } catch { ui.pointerHint.classList.remove('hidden'); }
}
function restartFromCheckpoint() {
  if (state === 'dead') showScreen(null);
  state = 'playing'; loadCheckpoint(); ui.hud.classList.remove('hidden');
  try { canvas.requestPointerLock(); } catch { ui.pointerHint.classList.remove('hidden'); }
}
function die() {
  health = 0; updateHUD(); state = 'dead'; showScreen(ui.death); ui.hud.classList.add('hidden');
  intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
}
function finishMission() {
  if (missionComplete) return;
  missionComplete = true; state = 'complete'; ui.hud.classList.add('hidden');
  $('result-kills').textContent = kills; $('result-accuracy').textContent = `${shotsFired ? Math.round(shotsHit / shotsFired * 100) : 0}%`; $('result-health').textContent = Math.round(health);
  showScreen(ui.complete); intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
  clearSave(); playBeep(880, .35);
}

// ---------- Combate e movimentação. ----------
function canMoveTo(x, z) {
  if (x < -18 || x > 18 || z > 33 || z < -105) return false;
  for (const c of colliders) if (Math.hypot(x - c.x, z - c.z) < c.r + player.radius) return false;
  return true;
}
function startReload() {
  if (isReloading || ammo >= 8 || reserveAmmo <= 0 || state !== 'playing') return;
  isReloading = true; reloadTime = 1.55; ui.reload.textContent = 'RECARREGANDO'; playBeep(270, .06);
}
function finishReload() {
  const amount = Math.min(8 - ammo, reserveAmmo); ammo += amount; reserveAmmo -= amount; isReloading = false; ui.reload.textContent = ''; updateHUD(); playBeep(410, .08);
}
function shoot() {
  if (state !== 'playing' || !pointerLocked || isReloading || fireCooldown > 0) return;
  if (ammo <= 0) { playBeep(130, .08); startReload(); return; }
  ammo--; shotsFired++; fireCooldown = .34; recoil = Math.min(.12, recoil + .085); updateHUD(); playShotSound();
  muzzleFlash.visible = true; muzzleFlash.userData.light.intensity = 4.5;
  const direction = new THREE.Vector3(); camera.getWorldDirection(direction);
  raycaster.set(camera.position, direction); raycaster.far = 65;
  const targets = enemies.filter(e => e.alive).flatMap(e => e.hitMeshes);
  const intersections = raycaster.intersectObjects(targets, false);
  let end = camera.position.clone().add(direction.clone().multiplyScalar(55));
  if (intersections.length) {
    const hit = intersections[0]; end.copy(hit.point);
    const enemy = hit.object.userData.enemy;
    if (enemy && enemy.alive) {
      const headshot = hit.object.userData.part === 'head' || hit.object.userData.part === 'eye';
      const damage = headshot ? 42 : 29;
      enemy.health -= damage; shotsHit++; hitTime = .16; ui.hit.classList.remove('hidden');
      enemy.group.traverse(obj => { if (obj.isMesh && obj.material && obj.material.emissive) { obj.material.emissive.setHex(0x5b225d); obj.material.emissiveIntensity = .8; } });
      if (enemy.health <= 0) {
        enemy.alive = false; kills++; enemy.group.rotation.x = -Math.PI / 2; enemy.group.position.y = .1;
        enemy.group.traverse(obj => { if (obj.isMesh) { obj.material = obj.material.clone(); obj.material.color?.multiplyScalar(.6); } });
        if (ambushTriggered && enemies.every(e => !e.alive)) {
          missionPhase = 2; updateObjective('RESGATE O OPERADOR DE RÁDIO');
          showToast('ÁREA SEGURA', 'Os Errantes foram neutralizados. Localize o operador junto ao abrigo.', 5);
          showRadio('Moretti: “Boa, Raul. O operador está próximo ao abrigo improvisado. Vá buscá-lo.”', 5);
          playBeep(620, .16); checkpoint = { x: player.position.x, z: player.position.z, health, ammo, reserve: reserveAmmo, phase: 2, operatorRescued: false }; saveGame();
        } else if (ambushTriggered) updateObjective(`ELIMINE OS ERRANTES · ${kills} / 3`);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry().setFromPoints([camera.position.clone(), end]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf2c27a, transparent: true, opacity: .75 })); scene.add(line); effects.push({ type: 'tracer', object: line, life: .055 });
}
function damagePlayer(amount) {
  health = Math.max(0, health - amount); updateHUD(); damageFlashTime = .22; ui.damage.style.opacity = '.85';
  if (health <= 0) die();
}
function updatePlayer(dt) {
  if (state !== 'playing') return;
  const forwardInput = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  const sideInput = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const moving = forwardInput !== 0 || sideInput !== 0;
  const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(worldUp, yaw);
  const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(worldUp, yaw);
  const wish = new THREE.Vector3().addScaledVector(forward, forwardInput).addScaledVector(right, sideInput);
  if (wish.lengthSq() > 0) wish.normalize();
  isCrouching = !!keys.ControlLeft || !!keys.ControlRight;
  const sprinting = (keys.ShiftLeft || keys.ShiftRight) && !isCrouching && !aiming;
  const speed = isCrouching ? 2.15 : sprinting ? 7.0 : 4.7;
  const dx = wish.x * speed * dt; const dz = wish.z * speed * dt;
  const nextX = player.position.x + dx; if (canMoveTo(nextX, player.position.z)) player.position.x = nextX;
  const nextZ = player.position.z + dz; if (canMoveTo(player.position.x, nextZ)) player.position.z = nextZ;
  if (keys.Space && grounded && !isCrouching) { jumpVelocity = 5.2; grounded = false; }
  if (!grounded) { player.position.y += jumpVelocity * dt; jumpVelocity -= 13.5 * dt; if (player.position.y <= (isCrouching ? 1.05 : 1.7)) { player.position.y = isCrouching ? 1.05 : 1.7; jumpVelocity = 0; grounded = true; } }
  const targetHeight = isCrouching ? 1.08 : 1.7;
  if (grounded) player.position.y += (targetHeight - player.position.y) * Math.min(1, dt * 10);
  camera.position.copy(player.position);
  camera.rotation.set(pitch - recoil, yaw, 0);
  const targetFov = aiming ? Math.max(55, settings.fov - 20) : settings.fov;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 12); camera.updateProjectionMatrix();
  const bob = moving ? Math.sin(elapsedMission * (sprinting ? 13 : 9)) * (sprinting ? .012 : .007) : 0;
  const targetWeaponPos = aiming ? new THREE.Vector3(.13, -.28, -.5) : new THREE.Vector3(.38, -.34 + bob, -.58);
  weaponGroup.position.lerp(targetWeaponPos, Math.min(1, dt * 12));
  weaponGroup.rotation.z += ((moving ? Math.sin(elapsedMission * 8) * .012 : 0) - weaponGroup.rotation.z) * Math.min(1, dt * 9);
  recoil = Math.max(0, recoil - dt * .42);
  if (fireCooldown > 0) fireCooldown -= dt;
  if (muzzleFlash.visible) { muzzleFlash.visible = false; muzzleFlash.userData.light.intensity = 0; }
  if (isReloading) { reloadTime -= dt; if (reloadTime <= 0) finishReload(); }
  if (missionPhase === 0 && player.position.z < -8) {
    missionPhase = 1; updateObjective('ELIMINE OS ERRANTES · 0 / 3'); triggerAmbush();
  }
  if (operatorRescued && player.position.z < -91) finishMission();
  if (player.position.z < -17 && !ambushTriggered) triggerAmbush();
  updateInteractPrompt();
}
function updateEnemies(dt) {
  if (state !== 'playing') return;
  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = player.position.x - e.group.position.x; const dz = player.position.z - e.group.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 1.42) {
      const step = e.speed * dt; const nx = e.group.position.x + dx / Math.max(distance, .001) * step; const nz = e.group.position.z + dz / Math.max(distance, .001) * step;
      // Evita atravessar os veículos e grandes obstáculos: tenta uma pequena deriva lateral.
      if (!enemyBlocked(nx, nz)) { e.group.position.x = nx; e.group.position.z = nz; }
      else {
        const sign = Math.sign(dx || 1); const sx = e.group.position.x + sign * step; const sz = e.group.position.z + step * .65;
        if (!enemyBlocked(sx, sz)) { e.group.position.x = sx; e.group.position.z = sz; }
      }
      e.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
      e.group.position.y = Math.abs(Math.sin(elapsedMission * 7 + e.phase)) * .055;
    } else {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) { e.attackTimer = 1.25; damagePlayer(e.damage); playBeep(90, .08); }
    }
    e.group.children.forEach((child, i) => { if (child.isMesh && child.geometry.type === 'CylinderGeometry' && i % 2 === 0) child.rotation.x = Math.sin(elapsedMission * 7 + e.phase) * .12; });
  }
}
function enemyBlocked(x, z) {
  for (const c of colliders) if (Math.hypot(x - c.x, z - c.z) < c.r + .35) return true;
  return false;
}
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    if (e.type === 'smoke') { e.phase += dt; e.object.position.y = e.baseY + Math.sin(e.phase * .65) * .25 + e.phase * .015; e.object.material.opacity = .15 + (Math.sin(e.phase * .4) + 1) * .05; continue; }
    e.life -= dt;
    if (e.type === 'tracer') e.object.material.opacity = Math.max(0, e.life / .055) * .75;
    if (e.life <= 0) { scene.remove(e.object); e.object.geometry?.dispose?.(); e.object.material?.dispose?.(); effects.splice(i, 1); }
  }
  if (dustField) dustField.rotation.y += dt * .006;
  if (damageFlashTime > 0) { damageFlashTime -= dt; ui.damage.style.opacity = String(Math.max(0, damageFlashTime / .22) * .85); }
  if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) ui.toast.classList.add('hidden'); }
  if (radioTime > 0) { radioTime -= dt; if (radioTime <= 0) ui.radio.classList.add('hidden'); }
  if (hitTime > 0) { hitTime -= dt; if (hitTime <= 0) ui.hit.classList.add('hidden'); }
}
function updateGame(dt) {
  if (state !== 'playing') return;
  elapsedMission += dt;
  updatePlayer(dt); updateEnemies(dt); updateEffects(dt); updateHUD();
  if (settings.showFPS) {
    fpsFrames++; fpsTimer += dt;
    if (fpsTimer > .5) { fpsValue = Math.round(fpsFrames / fpsTimer); fpsFrames = 0; fpsTimer = 0; ui.fps.textContent = `${fpsValue} FPS`; ui.fps.classList.remove('hidden'); }
  }
}

// ---------- Entrada e ciclo principal. ----------
function onMouseMove(event) {
  if (!pointerLocked || state !== 'playing') return;
  const scale = .0022 * settings.sensitivity;
  yaw -= event.movementX * scale; pitch -= event.movementY * scale;
  pitch = Math.max(-1.42, Math.min(1.42, pitch));
}
function requestLock() {
  if (state === 'playing' && !document.pointerLockElement) {
    try { canvas.requestPointerLock(); } catch { ui.pointerHint.classList.remove('hidden'); }
  }
}
function handleKeyDown(e) {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
  if (e.code === 'Escape') { if (state === 'playing') pauseGame(); else if (state === 'paused') resumeGame(); }
  if (e.code === 'KeyE' && !e.repeat) interact();
  if (e.code === 'KeyR' && !e.repeat) startReload();
}
function handleKeyUp(e) { keys[e.code] = false; }
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04);
  if (state === 'menu' || state === 'briefing') {
    const t = performance.now() * .00008; camera.position.set(15 + Math.sin(t) * 1.2, 10 + Math.sin(t * .7) * .25, 22); camera.lookAt(0, 1.5, -35);
    updateEffects(dt);
  } else if (state === 'playing') updateGame(dt);
  if (!settings.showFPS) ui.fps.classList.add('hidden');
  renderer.render(scene, camera);
}

// ---------- Eventos de interface. ----------
$('new-game-btn').addEventListener('click', () => { initAudio(); newCampaign(); });
$('continue-btn').addEventListener('click', continueCampaign);
$('chapters-btn').addEventListener('click', () => showInfo('chapters'));
$('arsenal-btn').addEventListener('click', () => showInfo('arsenal'));
$('options-btn').addEventListener('click', () => showInfo('options'));
$('credits-btn').addEventListener('click', () => showInfo('credits'));
$('close-info').addEventListener('click', () => { showScreen(infoReturnScreen || ui.menu); });
$('briefing-back').addEventListener('click', () => { showScreen(ui.menu); state = 'menu'; });
$('start-mission-btn').addEventListener('click', beginGameplay);
$('resume-btn').addEventListener('click', resumeGame);
$('restart-checkpoint-btn').addEventListener('click', restartFromCheckpoint);
$('pause-objectives-btn').addEventListener('click', () => showInfo('objectives'));
$('pause-options-btn').addEventListener('click', () => showInfo('options'));
$('pause-menu-btn').addEventListener('click', () => { state = 'menu'; ui.hud.classList.add('hidden'); weaponGroup.visible = false; showScreen(ui.menu); updateContinueButton(); });
$('retry-btn').addEventListener('click', restartFromCheckpoint);
$('death-menu-btn').addEventListener('click', () => { state = 'menu'; weaponGroup.visible = false; showScreen(ui.menu); updateContinueButton(); });
$('complete-menu-btn').addEventListener('click', () => { state = 'menu'; weaponGroup.visible = false; showScreen(ui.menu); updateContinueButton(); });
canvas.addEventListener('click', () => { if (state === 'playing' && !pointerLocked) requestLock(); });
canvas.addEventListener('mousedown', e => { if (e.button === 0) shoot(); if (e.button === 2) aiming = true; });
window.addEventListener('mouseup', e => { if (e.button === 2) aiming = false; });
window.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
  if (pointerLocked) { ui.pointerHint.classList.add('hidden'); intentionalUnlock = false; }
  else if (state === 'playing' && !intentionalUnlock) pauseGame();
});
window.addEventListener('blur', () => { keys = Object.create(null); if (state === 'playing') pauseGame(); });
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

// ---------- Inicialização ----------
function boot() {
  ui.loadingFill.style.width = '18%'; ui.loadingStatus.textContent = 'CRIANDO TERRENO E ESTRADA';
  buildWorld();
  ui.loadingFill.style.width = '58%'; ui.loadingStatus.textContent = 'MONTANDO COMBOIO E POSTO AVANÇADO';
  createWeapon();
  ui.loadingFill.style.width = '82%'; ui.loadingStatus.textContent = 'PREPARANDO SISTEMAS DE COMBATE';
  camera.position.set(15, 10, 22); camera.lookAt(0, 1.5, -35);
  camera.fov = settings.fov; camera.updateProjectionMatrix();
  updateContinueButton(); updateHUD();
  ui.loadingFill.style.width = '100%'; ui.loadingStatus.textContent = 'OPERAÇÃO PRONTA';
  setTimeout(() => ui.loading.classList.add('done'), 300);
  setTimeout(() => ui.loading.style.display = 'none', 850);
  animate();
}
boot();
