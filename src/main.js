import * as THREE from 'three';

// OPERAÇÃO ECLIPSE — Missão 01 aprimorada, build 0.5.0 para GitHub Pages.
// Simulação, navegação e apresentação permanecem desacopladas para facilitar a expansão da campanha.

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
const COMPLETION_KEY = 'operacao-eclipse-completion-v1';
const TOTAL_ENEMIES = 6;
const WEAPONS = Object.freeze({
  rifle: { label: 'FUZIL SEMIAUTOMÁTICO', magSize: 8, reload: 1.55, cadence: .34, damage: 29, headDamage: 42, spreadHip: .018, spreadADS: .0035, kick: .085 },
  pistol: { label: 'PISTOLA DE SERVIÇO', magSize: 12, reload: 1.22, cadence: .22, damage: 19, headDamage: 31, spreadHip: .028, spreadADS: .007, kick: .053 }
});
const SETTINGS_KEY = 'operacao-eclipse-settings-v1';
const defaults = { volume: 55, sensitivity: 1, difficulty: 'soldado', quality: 'equilibrado', fov: 78, showFPS: false, invertY: false, reduceMotion: false, crosshair: true };
let settings = { ...defaults, ...readJSON(SETTINGS_KEY, {}) };
if (!['baixo', 'equilibrado', 'alto'].includes(settings.quality)) settings.quality = 'equilibrado';
if (!['recruta', 'soldado', 'veterano', 'pesadelo'].includes(settings.difficulty)) settings.difficulty = 'soldado';
settings.fov = Number.isFinite(settings.fov) ? Math.max(70, Math.min(100, settings.fov)) : defaults.fov;
let savedGame = readJSON(SAVE_KEY, null);
let completedMission = readJSON(COMPLETION_KEY, null);
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
let pistolAmmo = 12;
let pistolReserve = 36;
let currentWeapon = 'rifle';
let pistolGroup = null;
let pistolMuzzleFlash = null;
let rainField = null;
let rainPositions = null;
let rainDrops = [];
let impactTexture = null;
let warningTime = 0;
let damageDirectionTime = 0;
let weatherClock = 0;
let debugVisible = false;
let missionPhase = 0;
let operatorRescued = false;
let ambushTriggered = false;
let missionComplete = false;
let intelFound = false;
let stamina = 100;
let finalSpawnTimer = -1;
let finalWaveSpawned = false;
let gateOpening = false;
let gateOpen = false;
let muzzleTime = 0;
let saveIndicatorTime = 0;
let stepsTimer = 0;
let grenades = 2;
let grenadeCooldown = 0;
let meleeCooldown = 0;
let meleeTime = 0;
let shotKick = 0;
let cameraShake = 0;
let grenadeProjectiles = [];
let janusAnomalies = [];
let flashlight = null;
let sunLight = null;
let skyDome = null;
let grassField = null;
let groundDebris = null;
let qualitySeed = 0xC1A5E5;
const rand = () => { qualitySeed = (Math.imul(1664525, qualitySeed) + 1013904223) >>> 0; return qualitySeed / 4294967296; };

let worldObstacles = [];
let navigationGrid = null;
let noiseEvent = null;
let noiseEvents = [];
let noiseSequence = 0;
let noiseBurstTime = 0;
let loudNoiseUntil = 0;
let escortGroup = null;
let operatorCollider = null;
let impostorTexture = null;
let ambientAudio = null;
let activeInteractable = null;
let checkpoint = null;
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
scene.add(camera); // Necessário para desenhar a arma, filha da câmera.
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
let shadowUpdateTime = 0;
let crosshairSpread = 5;
function disposeEnemy(enemy) {
  scene.remove(enemy.group);
  enemy.group.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material && !Array.isArray(obj.material)) obj.material.dispose();
  });
}

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
  const canContinue = !!savedGame && [1, 2, 3].includes(savedGame.version) && savedGame.mission === '01' && !!savedGame.checkpoint;
  $('continue-btn').disabled = !canContinue;
  $('continue-btn').classList.toggle('primary', canContinue);
  $('new-game-btn').classList.toggle('primary', !canContinue);
  $('chapters-btn').disabled = !completedMission;
  $('chapters-btn').querySelector('small').textContent = completedMission ? 'REJOGAR MISSÃO 01' : 'DISPONÍVEL APÓS DESBLOQUEIO';
}
function saveSettings() { writeJSON(SETTINGS_KEY, settings); }
function saveGame() {
  if (!checkpoint) return;
  savedGame = { version: 3, mission: '01', checkpoint: { ...checkpoint }, difficulty: settings.difficulty };
  writeJSON(SAVE_KEY, savedGame);
  updateContinueButton();
  saveIndicatorTime = 2.2;
  $('save-indicator').classList.remove('hidden');
}
function captureCheckpoint(phase = missionPhase) {
  checkpoint = {
    x: player.position.x, z: player.position.z, phase, health: Math.max(1, health),
    ammo, reserve: reserveAmmo, pistolAmmo, pistolReserve, currentWeapon, grenades, operatorRescued, intelFound, stamina,
    pickups: pickups.map(p => p.used), kills, shotsFired, shotsHit, elapsedMission
  };
  saveGame();
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
function playPistolSound() {
  if (!audioContext || settings.volume <= 0) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(230, now);
  osc.frequency.exponentialRampToValueAtTime(72, now + .09);
  gain.gain.setValueAtTime(settings.volume / 100 * .23, now);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .14);
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.start(now); osc.stop(now + .15);
  if (noiseBuffer) {
    const src = audioContext.createBufferSource(); src.buffer = noiseBuffer;
    const filter = audioContext.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 800;
    const crack = audioContext.createGain(); crack.gain.setValueAtTime(settings.volume / 100 * .2, now);
    crack.gain.exponentialRampToValueAtTime(.0001, now + .065);
    src.connect(filter); filter.connect(crack); crack.connect(audioContext.destination);
    src.start(now); src.stop(now + .07);
  }
}
function playBeep(freq = 520, duration = .12) {
  if (!audioContext || settings.volume <= 0) return;
  const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
  osc.type = 'sine'; osc.frequency.value = freq; gain.gain.value = settings.volume / 100 * .08;
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration); osc.stop(audioContext.currentTime + duration);
}

function playStepSound() {
  if (!audioContext || settings.volume <= 0) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(105, now); osc.frequency.exponentialRampToValueAtTime(42, now + .09);
  gain.gain.setValueAtTime(settings.volume / 100 * .027, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .095);
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + .1);
}
function playThreatSound() {
  if (!audioContext || settings.volume <= 0) return;
  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
  osc.type = 'sawtooth'; osc.frequency.setValueAtTime(65, now); osc.frequency.exponentialRampToValueAtTime(115, now + .65);
  gain.gain.setValueAtTime(.0001, now); gain.gain.linearRampToValueAtTime(settings.volume / 100 * .055, now + .2);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .7);
  osc.connect(gain); gain.connect(audioContext.destination); osc.start(now); osc.stop(now + .72);
}
function playExplosionSound() {
  if (!audioContext || settings.volume <= 0) return;
  const now = audioContext.currentTime;
  const src = audioContext.createBufferSource(); src.buffer = noiseBuffer;
  const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 450;
  const gain = audioContext.createGain(); gain.gain.setValueAtTime(settings.volume / 100 * .75, now);
  gain.gain.exponentialRampToValueAtTime(.001, now + .32);
  src.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
  src.start(now); src.stop(now + .33);
}
function playMeleeSound() { playBeep(95, .085); }

// ---------- Construção do cenário. ----------
const mats = {};
function mat(name, color, roughness = 0.9, metalness = 0) {
  if (!mats[name]) mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return mats[name];
}
function addMesh(geometry, material, parent = scene, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z);
  mesh.castShadow = parent !== scene && parent !== camera && parent !== weaponGroup;
  mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function addBox(parent, x, y, z, sx, sy, sz, material, rotY = 0) {
  const mesh = addMesh(new THREE.BoxGeometry(sx, sy, sz), material, parent, x, y, z); mesh.rotation.y = rotY; return mesh;
}
function addCylinder(parent, x, y, z, rt, rb, h, material, segments = 8, rotX = 0, rotZ = 0) {
  const mesh = addMesh(new THREE.CylinderGeometry(rt, rb, h, segments), material, parent, x, y, z); mesh.rotation.x = rotX; mesh.rotation.z = rotZ; return mesh;
}
function addCollider(x, z, r) { const collider = { x, z, r, disabled: false }; colliders.push(collider); return collider; }
function registerCover(group) { group.traverse(obj => { if (obj.isMesh && !obj.material?.transparent) worldObstacles.push(obj); }); }

// Texturas procedurais: sem imagens externas, com detalhes de terra e cascalho.
function makeTerrainTexture(kind) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(256, 256);
  const base = kind === 'road' ? [75, 70, 58] : [59, 67, 55];
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const i = (y * 256 + x) * 4;
    const grain = (rand() - .5) * 33;
    const streak = kind === 'road' ? Math.sin(x * .27 + Math.sin(y * .035)) * 4 : Math.sin(x * .11 + y * .08) * 5;
    for (let c = 0; c < 3; c++) image.data[i + c] = Math.max(0, Math.min(255, base[c] + grain + streak));
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  for (let i = 0; i < 95; i++) {
    const x = rand() * 256, y = rand() * 256;
    ctx.fillStyle = i % 2 ? 'rgba(21,25,21,.19)' : 'rgba(171,155,118,.12)';
    ctx.fillRect(x, y, rand() * 7 + 1, rand() * 3 + 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(kind === 'road' ? 1.7 : 15, kind === 'road' ? 28 : 15);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return tex;
}
function createSkyDome() {
  skyDome = addMesh(new THREE.SphereGeometry(120, 24, 14), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vDir; void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec3 vDir; void main(){vec3 d=normalize(vDir);float h=clamp(d.y*.5+.5,0.,1.);vec3 col=mix(vec3(.52,.51,.46),vec3(.19,.25,.29),smoothstep(.26,.85,h));float sun=pow(max(dot(d,normalize(vec3(-.65,.28,.4))),0.),72.);col+=sun*vec3(.23,.17,.09);gl_FragColor=vec4(col,1.);}`
  }), scene);
  skyDome.frustumCulled = false;
}
function createBattlefieldDetails() {
  // Crateras, sinalização de campo e cercas. Sem física cara nem novas texturas externas.
  const crater = mat('crater', 0x292e29);
  for (const [x,z,r] of [[-6.3,-6.5,1.4],[6.8,-59,1.6],[-5.6,-75,1.2],[7.1,-4,1.1]]) {
    const pit = addMesh(new THREE.CircleGeometry(r, 20), crater, scene, x, -.105, z); pit.rotation.x = -Math.PI / 2;
    const rim = addMesh(new THREE.TorusGeometry(r * 1.04, .15, 5, 22), mat('craterRim', 0x5a5547), scene, x, -.06, z);
    rim.rotation.x = Math.PI / 2;
  }
  const sign = new THREE.Group(); sign.position.set(-6.8, 0, -5); sign.rotation.y = .18; scene.add(sign);
  addBox(sign, 0, 1.4, 0, .12, 2.8, .12, mat('pole', 0x39372d));
  addBox(sign, 0, 2.7, 0, 2.4, .67, .11, mat('signPaint', 0x414b3e));
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#4d5747'; ctx.fillRect(0,0,512,128);
  ctx.strokeStyle = '#d2c6a3'; ctx.lineWidth = 6; ctx.strokeRect(7,7,498,114);
  ctx.fillStyle = '#e3d8b5'; ctx.font = 'bold 43px Arial'; ctx.textAlign = 'center';
  ctx.fillText('POSTO NÉBULA', 256, 55); ctx.font = '29px Arial'; ctx.fillText('ACESSO MILITAR', 256, 98);
  const signTex = new THREE.CanvasTexture(canvas); signTex.colorSpace = THREE.SRGBColorSpace;
  const front = addMesh(new THREE.PlaneGeometry(2.35, .59), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }), sign, 0, 2.7, -.067);
  front.rotation.y = Math.PI;
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) {
    const z = -82 - i * 2.3, x = side * 12.7;
    addCylinder(scene, x, .65, z, .035, .04, 1.3, mat('wirePost', 0x3c403a), 5);
    if (i < 4) for (const h of [.65, 1.02]) {
      const wire = addCylinder(scene, x, h, z - 1.15, .012, .012, 2.3, mat('wire', 0x3b3d38, .55, .45), 4, Math.PI / 2);
      wire.rotation.x = Math.PI / 2;
    }
  }
}

function createScatteredDetails() {
  // Vegetação e entulho em InstancedMesh: poucos draw calls mesmo com centenas de peças.
  const grassGeo = new THREE.ConeGeometry(.11, .64, 3);
  grassField = new THREE.InstancedMesh(grassGeo, mat('dryGrass', 0x77775b), 310);
  const debrisGeo = new THREE.DodecahedronGeometry(.12, 0);
  groundDebris = new THREE.InstancedMesh(debrisGeo, mat('debrisStone', 0x5c5a50), 170);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 310; i++) {
    const side = rand() < .5 ? -1 : 1;
    dummy.position.set(side * (5.7 + rand() * 12), .22, 27 - rand() * 124);
    const sc = .35 + rand() * 1.25;
    dummy.scale.set(sc, sc, sc); dummy.rotation.set(0, rand() * 6.28, (rand() - .5) * .4);
    dummy.updateMatrix(); grassField.setMatrixAt(i, dummy.matrix);
  }
  for (let i = 0; i < 170; i++) {
    const side = rand() < .5 ? -1 : 1;
    dummy.position.set(side * (4.4 + rand() * 13), .05, 27 - rand() * 124);
    const sc = .4 + rand() * 1.7;
    dummy.scale.set(sc, sc * .45, sc); dummy.rotation.set(rand(), rand() * 6.28, rand());
    dummy.updateMatrix(); groundDebris.setMatrixAt(i, dummy.matrix);
  }
  grassField.instanceMatrix.needsUpdate = true; groundDebris.instanceMatrix.needsUpdate = true;
  scene.add(grassField, groundDebris);
  applySceneryDensity();
}
function applySceneryDensity() {
  if (grassField) grassField.count = settings.quality === 'baixo' ? 100 : settings.quality === 'alto' ? 310 : 210;
  if (groundDebris) groundDebris.count = settings.quality === 'baixo' ? 60 : settings.quality === 'alto' ? 170 : 110;
}
function createJanusAnomaly(x, z, scale = 1) {
  const group = new THREE.Group(); group.position.set(x, .2, z); group.scale.setScalar(scale); scene.add(group);
  const glow = new THREE.MeshBasicMaterial({ color: 0x9b69d1, transparent: true, opacity: .55, depthWrite: false });
  for (let i = 0; i < 4; i++) {
    const shard = addMesh(new THREE.OctahedronGeometry(.18 + rand() * .14), glow, group,
      Math.cos(i * 1.57) * .45, .4 + rand() * .65, Math.sin(i * 1.57) * .45);
    shard.scale.set(.55, 2 + rand() * 2, .55);
  }
  const ring = addMesh(new THREE.TorusGeometry(.7, .035, 5, 28), glow, group, 0, .25, 0);
  ring.rotation.x = Math.PI / 2;
  janusAnomalies.push({ group, ring, baseY: group.position.y, phase: rand() * 6.28 });
}
function createRain() {
  // Gotas 3D próximas ao jogador, sem textura externa nem transparência pesada.
  const maxDrops = 260;
  rainPositions = new Float32Array(maxDrops * 3);
  rainDrops = [];
  for (let i = 0; i < maxDrops; i++) {
    const x = (rand() - .5) * 28, y = rand() * 13 + .2, z = (rand() - .5) * 30;
    rainDrops.push({ x, y, z, speed: 8 + rand() * 7 });
    rainPositions[i * 3] = x; rainPositions[i * 3 + 1] = y; rainPositions[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  rainField = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xc6d2ce, size: .048, transparent: true, opacity: .45, depthWrite: false }));
  rainField.frustumCulled = false;
  scene.add(rainField);
  applyRainQuality();
}
function applyRainQuality() {
  if (!rainField) return;
  const n = settings.quality === 'baixo' ? 65 : settings.quality === 'alto' ? 260 : 150;
  rainField.geometry.setDrawRange(0, n);
}
function updateRain(dt) {
  if (!rainField || state !== 'playing') { if (rainField) rainField.visible = false; return; }
  rainField.visible = true;
  rainField.position.set(player.position.x, 0, player.position.z);
  for (let i = 0; i < rainDrops.length; i++) {
    const d = rainDrops[i]; d.y -= d.speed * dt;
    d.x += dt * .85;
    if (d.y < .12) { d.y += 12.8; d.x = (rand() - .5) * 28; d.z = (rand() - .5) * 30; }
    if (d.x > 14) d.x = -14;
    rainPositions[i * 3] = d.x;
    rainPositions[i * 3 + 1] = d.y;
    rainPositions[i * 3 + 2] = d.z;
  }
  rainField.geometry.attributes.position.needsUpdate = true;
}
function addPropInstances(material, placements) {
  if (!placements.length) return null;
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, placements.length);
  const dummy = new THREE.Object3D();
  placements.forEach((p, i) => {
    dummy.position.set(p[0], p[1], p[2]);
    dummy.rotation.set(p[6] || 0, p[7] || 0, p[8] || 0);
    dummy.scale.set(p[3], p[4], p[5]);
    dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
function createBattlefieldProps() {
  // Props instanciados: sete lotes para manter baixo o número de draw calls.
  const whiteMarkers = [], redStripes = [], posts = [], beams = [], wires = [], stakes = [], scraps = [], woodScraps = [];
  for (let i = 0; i < 14; i++) {
    const z = 14 - i * 8.2;
    const x = (i % 2 ? -1 : 1) * (5.5 + rand() * 1.1);
    whiteMarkers.push([x, .44, z, .3, .88, .28]);
    redStripes.push([x, .68, z - .148, .31, .12, .03]);
  }
  for (const [x, z, rot] of [[-10,-11,.3],[11,-42,-.4],[-9,-73,.15],[10,-88,-.15]]) {
    for (let j = 0; j < 3; j++) posts.push([x + (j - 1) * .72 * Math.cos(rot), .62 + (j % 2) * .09,
      z - (j - 1) * .72 * Math.sin(rot), .15, 1.2, .16, 0, rot, (j - 1) * .12]);
    for (const h of [.36, .88]) beams.push([x, h, z, 2.5, .12, .13, 0, rot]);
  }
  for (const [x, z, length] of [[-12,-30,6],[12,-64,7],[-12,-87,5]]) {
    for (let i = 0; i <= length; i++) {
      const zz = z - i * .75;
      if (i % 2 === 0) stakes.push([x, .5, zz, .055, 1, .055]);
      if (i < length) for (const y of [.38,.7]) wires.push([x, y, zz - .375, .018, .018, .75]);
    }
  }
  for (let i = 0; i < 32; i++) {
    const x = (i < 16 ? -2.8 : 4.1) + (rand() - .5) * 8;
    const z = (i < 16 ? -21 : -32) + (rand() - .5) * 9;
    (i % 3 ? scraps : woodScraps).push([x, -.025, z, .12 + rand() * .5, .05, .1 + rand() * .7, 0, rand() * 6.28]);
  }
  addPropInstances(mat('roadMarker', 0x858577), whiteMarkers);
  addPropInstances(mat('roadMarkerRed', 0x6d4039), redStripes);
  addPropInstances(mat('brokenTimber', 0x40392f), [...posts, ...beams, ...woodScraps]);
  addPropInstances(mat('rustedIron', 0x413f35, .88, .2), [...wires, ...stakes, ...scraps]);
}
function createRoadRuts() {
  const rutMat = new THREE.MeshStandardMaterial({ color: 0x2d302b, roughness: 1, transparent: true, opacity: .5, depthWrite: false });
  for (const x of [-1.65, 1.65]) for (let i = 0; i < 20; i++) {
    const z = 24 - i * 6.2;
    const strip = addMesh(new THREE.PlaneGeometry(.27 + rand() * .17, 3.5 + rand() * 2), rutMat, scene, x + (rand() - .5) * .24, -.095, z);
    strip.rotation.x = -Math.PI / 2;
  }
  const puddleMat = new THREE.MeshStandardMaterial({ color: 0x59645e, metalness: .2, roughness: .19, transparent: true, opacity: .53, depthWrite: false });
  for (const [x, z, w, h] of [[2.8,-11,1.5,2.7],[-2.4,-42,1.2,2.4],[.5,-67,1.4,1.8],[-1.9,-80,1.8,2.3]]) {
    const puddle = addMesh(new THREE.CircleGeometry(1, 18), puddleMat, scene, x, -.085, z);
    puddle.rotation.x = -Math.PI / 2; puddle.scale.set(w, h, 1);
  }
}

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
  rock.scale.set(1.3 * scale, .65 * scale, .9 * scale); rock.rotation.set(rand(), rand(), rand());
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
  // Grade, faróis, para-choques e detalhes da carroceria, sem texturas pesadas.
  addBox(g, 0, 1.23, -2.43, 1.48, .6, .09, metal);
  for (let i = -3; i <= 3; i++) addBox(g, i * .17, 1.23, -2.495, .045, .48, .02, mat('truckGrille', 0x777363, .55, .4));
  for (const side of [-1, 1]) {
    const lamp = addCylinder(g, side * .91, 1.36, -2.52, .18, .18, .08, mat('headlamp', 0x9e8b69, .3, .35), 10, Math.PI / 2);
    lamp.rotation.x = Math.PI / 2;
    addBox(g, side * 1.04, 1.74, -.8, .06, .3, .36, metal);
    addBox(g, side * 1.26, 1.8, -.8, .34, .05, .3, metal);
  }
  addBox(g, 0, .71, -2.57, 2.5, .19, .18, metal);
  for (const zz of [.15,.95,1.8]) addBox(g, 0, 2.4, zz, 2.28, .06, .07, metal);

  if (destroyed) {
    const debris = addBox(g, .3, 2.25, -1.1, .22, .1, 1.6, metal, .5); debris.rotation.z = .22;
    addBox(g, -.6, 1.65, 2.2, .8, .2, .4, mat('wood', 0x514637), .5);
    const fireMat = new THREE.MeshBasicMaterial({ color: 0x9e4928, transparent: true, opacity: .28 });
    const ember = addMesh(new THREE.SphereGeometry(.6, 7, 6), fireMat, g, .8, 1.05, -1.2); ember.scale.set(1.2, .45, 1.3);
  }
  addCollider(x, z, 3.35);
  registerCover(g);
  return g;
}
function makeSandbagLine(x, z, count = 5, rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  for (let i = 0; i < count; i++) {
    const bag = addMesh(new THREE.BoxGeometry(1.1, .42, .55), mat('sandbag', 0x77715b), g, (i - (count - 1) / 2) * .95, .22, 0);
    bag.rotation.y = (i % 2) * .07; bag.rotation.z = (i % 2 ? .025 : -.025);
  }
  addCollider(x, z, count * .46 + .5);
  registerCover(g);
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
  registerCover(g);
}
function makeOutpost() {
  const g = new THREE.Group(); g.position.set(0, 0, -96); scene.add(g);
  const concrete = mat('outpostConcrete', 0x555950); const olive = mat('outpostOlive', 0x42483c);
  addBox(g, -7, 2.2, 0, 1.3, 4.4, 1.2, concrete);
  addBox(g, 7, 2.2, 0, 1.3, 4.4, 1.2, concrete);
  addBox(g, 0, 4.25, 0, 14.7, .55, 1.2, concrete);
  addBox(g, -6.25, 1.5, -.2, .9, 2.8, .25, olive);
  addBox(g, 6.25, 1.5, -.2, .9, 2.8, .25, olive);
  const gate = new THREE.Group(); gate.position.set(0, 1.35, -.1); g.add(gate);
  for (let i = -5; i <= 5; i++) addBox(gate, i * 1.05, 0, 0, .12, 2.7, .22, mat('gateMetal', 0x252a26, .6, .35));
  addBox(gate, 0, 1.3, 0, 11.1, .15, .25, mat('gateMetal', 0x252a26, .6, .35));
  gate.userData.isGate = true; g.userData.gate = gate; outpostGate = gate;
  addBox(g, 0, 2.3, -8, 11, 4.6, 1, concrete);
  addBox(g, 0, 4.7, -8, 11.5, .4, 1.4, olive);
  addCollider(-7, -96, 1.2); addCollider(7, -96, 1.2);
  registerCover(g);
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
  createSkyDome();
  scene.add(new THREE.HemisphereLight(0xc1c4b5, 0x36372e, 1.05));
  const sun = new THREE.DirectionalLight(0xffd7a0, 1.75); sunLight = sun; sun.position.set(-28, 42, 22); sun.castShadow = settings.quality === 'alto';
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -45; sun.shadow.camera.right = 45; sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45; scene.add(sun); scene.add(sun.target);
  const warm = new THREE.PointLight(0xb87543, 13, 25, 2); warm.position.set(-5, 4, -24); scene.add(warm);
  addMesh(new THREE.PlaneGeometry(190, 190), new THREE.MeshStandardMaterial({ map: makeTerrainTexture('ground'), roughness: 1 }), scene, 0, -.22, -32).rotation.x = -Math.PI / 2;
  addMesh(new THREE.PlaneGeometry(9, 145), new THREE.MeshStandardMaterial({ map: makeTerrainTexture('road'), roughness: 1 }), scene, 0, -.12, -35).rotation.x = -Math.PI / 2;
  // Ombros de terra e sulcos na estrada.
  addMesh(new THREE.PlaneGeometry(5, 145), mat('shoulder', 0x514d3e), scene, -6.7, -.13, -35).rotation.x = -Math.PI / 2;
  addMesh(new THREE.PlaneGeometry(5, 145), mat('shoulder', 0x514d3e), scene, 6.7, -.13, -35).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 28; i++) {
    const z = 22 - i * 4.2;
    addGroundPatch((rand() - .5) * 5, z, .2 + rand() * .8, .12 + rand() * .3, i % 3 ? 0x363a32 : 0x5c5747, .75);
  }
  // Colinas de fundo e silhueta do vale.
  for (let i = 0; i < 13; i++) {
    const side = i % 2 ? -1 : 1; const x = side * (23 + rand() * 22); const z = -8 - rand() * 105;
    const hill = addMesh(new THREE.ConeGeometry(9 + rand() * 9, 18 + rand() * 18, 7), mat('hill', i % 2 ? 0x505548 : 0x5b5c4f), scene, x, 4, z);
    hill.rotation.z = (rand() - .5) * .2;
  }
  const treePositions = [
    [-10, 15, 1.2], [11, 13, 1.25], [-13, 1, 1.5], [14, -4, 1.2], [-12, -13, 1.1], [12, -18, 1.3],
    [-16, -29, 1.5], [16, -30, 1.25], [-11, -43, 1.3], [13, -48, 1.4], [-18, -58, 1.2], [17, -63, 1.4],
    [-11, -73, 1.1], [12, -77, 1.2], [-16, -88, 1.35], [16, -88, 1.35], [-23, -15, 1.3], [24, -42, 1.3],
    [-24, -68, 1.4], [23, -91, 1.3]
  ];
  treePositions.forEach(([x, z, s]) => addTree(x, z, s));
  for (let i = 0; i < 18; i++) addRock((rand() < .5 ? -1 : 1) * (7 + rand() * 11), 18 - rand() * 110, .35 + rand() * .8);
  makeTelegraphPole(-9, 8); makeTelegraphPole(9, -48); makeTelegraphPole(-10, -80);
  // Comboio destruído: dois caminhões, destroços e cobertura.
  makeTruck(-2.8, -21, -.22, true);
  makeTruck(4.1, -32, .28, true);
  makeSandbagLine(-7.4, -17, 5, .1); makeSandbagLine(8, -38, 4, -.2);
  worldObstacles.push(addBox(scene, -7.4, .55, -28, 1.1, 1.1, 1.1, mat('crate', 0x5a4c38), .2)); addCollider(-7.4, -28, .9);
  worldObstacles.push(addBox(scene, 7.5, .55, -24, 1.2, 1.1, 1.1, mat('crate', 0x554a39), -.3)); addCollider(7.5, -24, .9);
  worldObstacles.push(addBox(scene, 8.1, .45, -43, 1.4, .9, 1.2, mat('crate', 0x4e4839), .4)); addCollider(8.1, -43, 1);
  makeRuinedHouse(-15, -55);
  // Abrigo de campanha junto ao operador.
  addBox(scene, 7.2, 1.45, -49, 4.8, .18, 4.5, mat('canvas', 0x494d40));
  addCylinder(scene, 5.1, 1.35, -49, .07, .07, 3.2, mat('pole', 0x4a463a), 6);
  addCylinder(scene, 9.3, 1.35, -49, .07, .07, 3.2, mat('pole', 0x4a463a), 6);
  makeOutpost();
  createRoadRuts(); createScatteredDetails(); createBattlefieldDetails(); createBattlefieldProps(); createRain();
  createJanusAnomaly(-5.2, -35, .8); createJanusAnomaly(-12.2, -59, 1.05);
  // Suprimentos posicionados antes da emboscada.
  createPickup('medkit', -7.8, -13.5, 'KIT MÉDICO');
  createPickup('ammo', 8.3, -28.8, 'MUNIÇÃO');
  createPickup('intel', -9.3, -61, 'DOCUMENTO JANUS');
  createPickup('ammo', -6.7, -70.5, 'MUNIÇÃO');
  createPickup('medkit', 7.5, -77, 'KIT MÉDICO');
  createPickup('grenade', 5.7, -68, 'GRANADAS');
  createRadioOperator();
  createEscortOperator();
  decorateFinalApproach();
  createSmoke(-2, 3.2, -22); createSmoke(4, 3.8, -32); createDust();
}

function decorateFinalApproach() {
  // Trilho de abastecimento, guaritas, iluminação e antenas de campo.
  for (const z of [-64, -71, -78, -86]) {
    addGroundPatch(-3.4, z, .75, 1.3, 0x31392f, .85);
    addGroundPatch(2.7, z + 1.3, .6, 1.1, 0x38392f, .85);
  }
  for (const x of [-5.8, 5.8]) {
    const g = new THREE.Group(); g.position.set(x, 0, -91); scene.add(g);
    addCylinder(g, 0, 2.1, 0, .1, .15, 4.2, mat('pole', 0x39372d), 7);
    addMesh(new THREE.ConeGeometry(.45, .45, 7), mat('gateMetal', 0x252a26), g, 0, 4.1, 0);
    const lamp = addMesh(new THREE.SphereGeometry(.2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb96b }), g, 0, 3.8, 0);
    lamp.userData.glow = true;
  }
  makeSandbagLine(-8.3, -86, 4, .25);
  makeSandbagLine(8.3, -87, 4, -.2);
  const mast = new THREE.Group(); mast.position.set(-12.5, 0, -91); scene.add(mast);
  addCylinder(mast, 0, 5.3, 0, .08, .15, 10.6, mat('gateMetal', 0x252a26), 6);
  addCylinder(mast, 0, 8.4, 0, 1.15, 1.15, .07, mat('radioDial', 0x9c8b63), 10, 0, Math.PI / 2);
  createSmoke(-11, 1.4, -88);
}
function createEscortOperator() {
  escortGroup = new THREE.Group(); escortGroup.visible = false; scene.add(escortGroup);
  const cloth = mat('operatorUniform', 0x4b5145), skin = mat('operatorSkin', 0x9a8269);
  addMesh(new THREE.CapsuleGeometry(.3, .72, 4, 7), cloth, escortGroup, 0, 1.17, 0);
  addMesh(new THREE.SphereGeometry(.22, 8, 6), skin, escortGroup, 0, 1.94, 0);
  addBox(escortGroup, 0, 2.13, 0, .51, .17, .5, mat('helmet', 0x555c4a));
  for (const side of [-1, 1]) {
    addCylinder(escortGroup, side * .19, .46, 0, .13, .13, .82, cloth, 7);
    addCylinder(escortGroup, side * .43, 1.25, 0, .105, .1, .72, cloth, 7, 0, side * .18);
  }
  addBox(escortGroup, 0, 1.15, .31, .6, .58, .24, mat('radioBody', 0x303631));
  escortGroup.userData.walkTime = 0;
}
function createPickup(type, x, z, label) {
  const g = new THREE.Group(); g.position.set(x, .5, z); scene.add(g);
  if (type === 'medkit') {
    addBox(g, 0, 0, 0, .75, .45, .55, mat('medkitWhite', 0xc9c5b1));
    addBox(g, 0, .235, 0, .16, .025, .58, mat('medkitRed', 0x8f4034));
    addBox(g, 0, .235, 0, .58, .025, .16, mat('medkitRed', 0x8f4034));
  } else if (type === 'grenade') {
    addMesh(new THREE.SphereGeometry(.25, 8, 6), mat('grenadeGreen', 0x485445, .8, .3), g, 0, 0, 0);
    addCylinder(g, 0, .32, 0, .11, .09, .19, mat('ammoMetal', 0x282d27, .6, .2), 8);
  } else if (type === 'intel') {
    addBox(g, 0, 0, 0, .52, .05, .68, mat('paper', 0xb4a17a), .3);
    addBox(g, 0, .045, -.1, .3, .02, .035, mat('radioBody', 0x303631));
    addBox(g, 0, .045, .03, .3, .02, .035, mat('radioBody', 0x303631));
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
  operatorCollider = addCollider(4.7, -45.5, .65);
}

function activeWeapon() { return WEAPONS[currentWeapon]; }
function activeWeaponGroup() { return currentWeapon === 'rifle' ? weaponGroup : pistolGroup; }
function updateWeaponVisibility() {
  const visible = state === 'playing';
  if (weaponGroup) weaponGroup.visible = visible && currentWeapon === 'rifle';
  if (pistolGroup) pistolGroup.visible = visible && currentWeapon === 'pistol';
}
function switchWeapon(next) {
  if (state !== 'playing' || !WEAPONS[next] || next === currentWeapon) return;
  if (isReloading) { isReloading = false; reloadTime = 0; ui.reload.textContent = ''; }
  currentWeapon = next; aiming = false; fireCooldown = Math.max(fireCooldown, .15);
  updateWeaponVisibility(); updateHUD(); playBeep(390, .06);
  showToast('ARMA EQUIPADA', WEAPONS[next].label, 1.5);
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
  // Detalhes da arma: ferrolho, carregador, anéis de metal, alça de mira e mãos.
  addBox(weaponGroup, .02, -.16, -.12, .13, .23, .12, steel);
  addBox(weaponGroup, .1, .045, -.05, .13, .045, .08, steel);
  addCylinder(weaponGroup, .16, .05, -.05, .022, .022, .18, steel, 6, 0, Math.PI / 2);
  addCylinder(weaponGroup, .02, .015, -.72, .054, .054, .07, dark, 10, Math.PI / 2);
  const glove = mat('glove', 0x5a5b48);
  addMesh(new THREE.SphereGeometry(.13, 8, 6), glove, weaponGroup, -.12, -.16, -.36);
  addMesh(new THREE.SphereGeometry(.12, 8, 6), glove, weaponGroup, .15, -.23, .03);
  weaponGroup.position.set(.38, -.34, -.58); weaponGroup.rotation.set(-.02, -.03, -.015); weaponGroup.visible = false;
  muzzleFlash = addMesh(new THREE.SphereGeometry(.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb45e, transparent: true, opacity: .95 }), weaponGroup, .02, .02, -.99);
  muzzleFlash.visible = false;
  const flashLight = new THREE.PointLight(0xffa04a, 0, 4); flashLight.position.set(.02, .02, -.85); weaponGroup.add(flashLight); muzzleFlash.userData.light = flashLight;
  flashlight = new THREE.SpotLight(0xe2e9d7, 0, 24, Math.PI / 8, .55, 1.4);
  flashlight.position.set(0, -.16, 0); flashlight.target.position.set(0, -.1, -12);
  camera.add(flashlight, flashlight.target);
  flashlight.userData.enabled = false;
  pistolGroup = new THREE.Group(); camera.add(pistolGroup);
  const pistolSteel = mat('pistolSteel', 0x272b2a, .42, .7);
  const pistolGrip = mat('pistolGrip', 0x423c31, .92, .06);
  addBox(pistolGroup, 0, .06, -.19, .18, .2, .51, pistolSteel);
  addBox(pistolGroup, 0, .155, -.23, .18, .07, .47, mat('pistolSlide', 0x414645, .46, .7));
  addBox(pistolGroup, 0, -.17, -.01, .16, .38, .15, pistolGrip).rotation.x = -.26;
  addBox(pistolGroup, 0, -.07, -.16, .09, .08, .18, pistolSteel);
  addBox(pistolGroup, 0, .21, -.39, .05, .06, .045, pistolSteel);
  addBox(pistolGroup, 0, .21, -.02, .05, .05, .045, pistolSteel);
  addMesh(new THREE.SphereGeometry(.12, 8, 6), mat('glove', 0x5a5b48), pistolGroup, .03, -.3, .04);
  pistolGroup.position.set(.29, -.36, -.48); pistolGroup.visible = false;
  pistolMuzzleFlash = addMesh(new THREE.SphereGeometry(.075, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffce82, transparent: true, opacity: .9 }), pistolGroup, 0, .065, -.52);
  pistolMuzzleFlash.visible = false;
  const pistolLight = new THREE.PointLight(0xffae66, 0, 3.2); pistolLight.position.set(0,.06,-.5); pistolGroup.add(pistolLight);
  pistolMuzzleFlash.userData.light = pistolLight;
}

// ---------- Inimigos 3D low-poly, impostores 2D e ataques telegrafados. ----------
function findClearSpawn(x, z) {
  if (!enemyBlocked(x, z, .45)) return { x, z };
  for (let radius = 1; radius <= 9; radius += 1) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const nx = x + Math.cos(angle) * radius, nz = z + Math.sin(angle) * radius;
      if (!enemyBlocked(nx, nz, .45)) return { x: nx, z: nz };
    }
  }
  return { x: 0, z: -67 };
}
// ---------- Navegação tática: grade estática + A* leve. ----------
// A grade é construída uma vez após o cenário. A IA recalcula rotas em baixa frequência,
// evitando perseguir o jogador através de caminhões, ruínas e barricadas.
const NAV_CONFIG = Object.freeze({ minX: -17.5, minZ: -103, cell: 1.25, maxX: 17.5, maxZ: 31 });
function buildNavigationGrid() {
  const cols = Math.round((NAV_CONFIG.maxX - NAV_CONFIG.minX) / NAV_CONFIG.cell) + 1;
  const rows = Math.round((NAV_CONFIG.maxZ - NAV_CONFIG.minZ) / NAV_CONFIG.cell) + 1;
  const blocked = new Uint8Array(cols * rows);
  for (let iz = 0; iz < rows; iz++) {
    const z = NAV_CONFIG.minZ + iz * NAV_CONFIG.cell;
    for (let ix = 0; ix < cols; ix++) {
      const x = NAV_CONFIG.minX + ix * NAV_CONFIG.cell;
      let isBlocked = x < -17.1 || x > 17.1 || z < -102.4 || z > 30.4;
      if (!isBlocked) {
        for (const c of colliders) {
          if (!c.disabled && Math.hypot(x - c.x, z - c.z) < c.r + .43) { isBlocked = true; break; }
        }
      }
      blocked[iz * cols + ix] = isBlocked ? 1 : 0;
    }
  }
  navigationGrid = { cols, rows, blocked, cell: NAV_CONFIG.cell, minX: NAV_CONFIG.minX, minZ: NAV_CONFIG.minZ };
  return navigationGrid;
}
function navigationCell(x, z) {
  const g = navigationGrid;
  const ix = Math.max(0, Math.min(g.cols - 1, Math.round((x - g.minX) / g.cell)));
  const iz = Math.max(0, Math.min(g.rows - 1, Math.round((z - g.minZ) / g.cell)));
  return iz * g.cols + ix;
}
function navigationPoint(index) {
  const g = navigationGrid;
  const ix = index % g.cols, iz = Math.floor(index / g.cols);
  return { x: g.minX + ix * g.cell, z: g.minZ + iz * g.cell };
}
function nearestWalkableCell(index, maxRadius = 10) {
  const g = navigationGrid;
  if (!g.blocked[index]) return index;
  const cx = index % g.cols, cz = Math.floor(index / g.cols);
  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (const dz of [-r, r]) {
        const x = cx + dx, z = cz + dz;
        if (x >= 0 && x < g.cols && z >= 0 && z < g.rows) {
          const candidate = z * g.cols + x;
          if (!g.blocked[candidate]) return candidate;
        }
      }
    }
    for (let dz = -r + 1; dz < r; dz++) {
      for (const dx of [-r, r]) {
        const x = cx + dx, z = cz + dz;
        if (x >= 0 && x < g.cols && z >= 0 && z < g.rows) {
          const candidate = z * g.cols + x;
          if (!g.blocked[candidate]) return candidate;
        }
      }
    }
  }
  return -1;
}
function heapPush(heap, item) {
  let i = heap.length; heap.push(item);
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].f <= item.f) break;
    heap[i] = heap[p]; i = p;
  }
  heap[i] = item;
}
function heapPop(heap) {
  if (!heap.length) return null;
  const first = heap[0], last = heap.pop();
  if (heap.length) {
    let i = 0;
    while (true) {
      let child = i * 2 + 1;
      if (child >= heap.length) break;
      if (child + 1 < heap.length && heap[child + 1].f < heap[child].f) child++;
      if (heap[child].f >= last.f) break;
      heap[i] = heap[child]; i = child;
    }
    heap[i] = last;
  }
  return first;
}
function navigationSegmentBlocked(x1, z1, x2, z2, radius = .36) {
  const dx = x2 - x1, dz = z2 - z1, lengthSq = dx * dx + dz * dz;
  for (const c of colliders) {
    if (c.disabled) continue;
    const t = lengthSq > 1e-8 ? Math.max(0, Math.min(1, ((c.x - x1) * dx + (c.z - z1) * dz) / lengthSq)) : 0;
    const px = x1 + dx * t, pz = z1 + dz * t;
    if ((px - c.x) ** 2 + (pz - c.z) ** 2 < (c.r + radius) ** 2) return true;
  }
  return false;
}
function findNavigationPath(startX, startZ, goalX, goalZ, radius = .36) {
  if (!navigationGrid) buildNavigationGrid();
  const g = navigationGrid;
  const start = nearestWalkableCell(navigationCell(startX, startZ));
  const goal = nearestWalkableCell(navigationCell(goalX, goalZ));
  if (start < 0 || goal < 0 || start === goal) return [];
  const total = g.cols * g.rows;
  const scores = new Float32Array(total); scores.fill(Infinity); scores[start] = 0;
  const parent = new Int32Array(total); parent.fill(-1);
  const closed = new Uint8Array(total);
  const heap = [];
  const heuristic = (a, b) => {
    const ax = a % g.cols, az = Math.floor(a / g.cols), bx = b % g.cols, bz = Math.floor(b / g.cols);
    const dx = Math.abs(ax - bx), dz = Math.abs(az - bz);
    return Math.max(dx, dz) + (Math.SQRT2 - 1) * Math.min(dx, dz);
  };
  heapPush(heap, { i: start, f: heuristic(start, goal) });
  const directions = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
  let visited = 0, found = false;
  while (heap.length && visited < 1800) {
    const current = heapPop(heap).i;
    if (closed[current]) continue;
    if (current === goal) { found = true; break; }
    closed[current] = 1; visited++;
    const cx = current % g.cols, cz = Math.floor(current / g.cols);
    for (const [dx, dz, cost] of directions) {
      const nx = cx + dx, nz = cz + dz;
      if (nx < 0 || nx >= g.cols || nz < 0 || nz >= g.rows) continue;
      const next = nz * g.cols + nx;
      if (g.blocked[next] || closed[next]) continue;
      // Não corta diagonalmente entre dois obstáculos.
      if (dx && dz && (g.blocked[cz * g.cols + nx] || g.blocked[nz * g.cols + cx])) continue;
      const candidate = scores[current] + cost;
      if (candidate < scores[next]) {
        scores[next] = candidate; parent[next] = current;
        heapPush(heap, { i: next, f: candidate + heuristic(next, goal) });
      }
    }
  }
  if (!found) return [];
  const reversed = [];
  let cursor = goal, guard = 0;
  while (cursor !== start && cursor >= 0 && guard++ < total) {
    reversed.push(navigationPoint(cursor)); cursor = parent[cursor];
  }
  if (cursor !== start) return [];
  reversed.reverse();
  // Suaviza a rota removendo pontos intermediários quando a linha está livre.
  const smooth = []; let ax = startX, az = startZ, i = 0;
  while (i < reversed.length) {
    let best = i;
    for (let j = i + 1; j < reversed.length; j++) {
      if (navigationSegmentBlocked(ax, az, reversed[j].x, reversed[j].z, radius)) break;
      best = j;
    }
    const point = reversed[best]; smooth.push(point); ax = point.x; az = point.z; i = best + 1;
  }
  return smooth;
}
function navigationTarget(actor, x, z, targetX, targetZ, radius, dt) {
  actor.pathTimer = Math.max(0, (actor.pathTimer || 0) - dt);
  const blocked = navigationSegmentBlocked(x, z, targetX, targetZ, radius);
  if (!blocked) { actor.path = []; actor.pathIndex = 0; actor.pathTimer = 0; actor.pathGoal = -1; return { x: targetX, z: targetZ }; }
  const goalCell = navigationCell(targetX, targetZ);
  if (!actor.path || actor.pathTimer <= 0) {
    actor.path = findNavigationPath(x, z, targetX, targetZ, radius);
    actor.pathIndex = 0; actor.pathTimer = .62; actor.pathGoal = goalCell;
  }
  while (actor.pathIndex < actor.path.length) {
    const point = actor.path[actor.pathIndex];
    if (Math.hypot(point.x - x, point.z - z) > .72) break;
    actor.pathIndex++;
  }
  return actor.path[actor.pathIndex] || { x: targetX, z: targetZ };
}
function emitNoise(radius, type = 'movement', x = player.position.x, z = player.position.z) {
  noiseEvent = { x, z, radius, type, time: elapsedMission, id: ++noiseSequence };
  noiseEvents.push(noiseEvent);
  if (noiseEvents.length > 32) noiseEvents.shift();
  if (['gunshot', 'grenade', 'explosion'].includes(type)) loudNoiseUntil = elapsedMission + 1.05;
  noiseBurstTime = Math.max(noiseBurstTime, .38);
}

function createEnemy(x, z, index, type = 'errante') {
  const spawn = findClearSpawn(x, z); x = spawn.x; z = spawn.z;
  const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
  if (type === 'rastejador') group.scale.set(.9, .62, 1.1);
  const flesh = new THREE.MeshStandardMaterial({ color: 0x373b36, roughness: .96 });
  const torn = new THREE.MeshStandardMaterial({ color: 0x252b29, roughness: 1 });
  const violet = new THREE.MeshStandardMaterial({ color: 0x8f59c6, emissive: 0x54227d, emissiveIntensity: 1.7, roughness: .35 });
  const bone = new THREE.MeshStandardMaterial({ color: 0x777466, roughness: .9 });
  const body = addMesh(new THREE.CapsuleGeometry(.34, .72, 3, 6), flesh, group, 0, 1.05, 0); body.rotation.x = -.12;
  const chest = addMesh(new THREE.DodecahedronGeometry(.37, 0), torn, group, 0, 1.28, -.05); chest.scale.set(1, 1.25, .72);
  const head = addMesh(new THREE.SphereGeometry(.25, 7, 6), flesh, group, 0, 1.83, -.05); head.scale.set(.8, 1.15, .85); head.userData.part = 'head';
  const arms = [], legs = [];
  for (const side of [-1, 1]) {
    const eye = addMesh(new THREE.SphereGeometry(.055, 6, 5), violet, group, side * .105, 1.88, -.27); eye.userData.part = 'eye';
    const arm = addCylinder(group, side * .42, 1.05, -.02, .12, .17, .88, flesh, 6, 0, side * -.17); arm.rotation.z = side * -.12; arms.push(arm);
    const hand = addMesh(new THREE.DodecahedronGeometry(.14, 0), bone, group, side * .48, .57, -.12);
    const leg = addCylinder(group, side * .18, .38, .02, .14, .19, .72, torn, 6, 0, side * .08);
    leg.rotation.z = side * .07; legs.push(leg);
  }
  const core = addMesh(new THREE.SphereGeometry(.12, 7, 6), violet, group, 0, 1.2, -.34);
  const aura = new THREE.PointLight(0x8b49b9, .8, 3.2); aura.position.set(0, 1.4, -.2); group.add(aura);
  const shadow = addMesh(new THREE.CircleGeometry(.65, 12), new THREE.MeshBasicMaterial({ color: 0x171a17, transparent: true, opacity: .35, depthWrite: false }), group, 0, .015, 0); shadow.rotation.x = -Math.PI / 2;
  const stats = enemyStats(type);
  const enemy = { group, type, x, z, health: stats.health, speed: stats.speed, damage: stats.damage,
    attackTimer: .7 + index * .25, windup: 0, recover: 0, alive: true,
    hitMeshes: [body, chest, head, core], phase: Math.random() * 6, index, state: 'chase', lastAttack: 0,
    renderMeshes: group.children.filter(obj => obj.isMesh), aura, lod: '3d', sprite: null, arms, legs, stagger: 0, attackPulse: 0, deadTime: 0,
    lastKnownX: player.position.x, lastKnownZ: player.position.z, lastSeenAt: elapsedMission, lastHeardAt: -999, heardNoiseId: -1,
    path: null, pathIndex: 0, pathTimer: 0, pathGoal: -1, lungeTime: 0, lungeDirX: 0, lungeDirZ: 0,
    baseScale: group.scale.clone(), deathStartX: 0, deathStartY: 0 };
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: getImpostorTexture(), transparent: true, alphaTest: .12, depthWrite: false }));
  sprite.position.set(0, 1.16, 0); sprite.scale.set(1.45, 2.25, 1); sprite.visible = false; group.add(sprite); enemy.sprite = sprite;
  [body, chest, head, core].forEach(m => m.userData.enemy = enemy);
  enemies.push(enemy);
  return enemy;
}
function enemyStats(type = 'errante') {
  const stats = {
    recruta: { health: 45, speed: 1.35, damage: 8 },
    soldado: { health: 58, speed: 1.65, damage: 11 },
    veterano: { health: 72, speed: 1.9, damage: 15 },
    pesadelo: { health: 88, speed: 2.15, damage: 19 }
  };
  const base = stats[settings.difficulty] || stats.soldado;
  return type === 'rastejador' ? { health: base.health * .7, speed: base.speed * 1.55, damage: Math.round(base.damage * .8) } : base;
}
function getImpostorTexture() {
  if (impostorTexture) return impostorTexture;
  const c = document.createElement('canvas'); c.width = 128; c.height = 192;
  const g = c.getContext('2d');
  g.fillStyle = '#272e2a';
  g.beginPath(); g.ellipse(64, 45, 22, 30, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(39, 72); g.lineTo(88, 72); g.lineTo(103, 138); g.lineTo(28, 138); g.closePath(); g.fill();
  g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(38, 88); g.lineTo(18, 145); g.moveTo(90, 88); g.lineTo(110, 145);
  g.moveTo(49, 131); g.lineTo(39, 185); g.moveTo(79, 131); g.lineTo(89, 185); g.strokeStyle = '#2d332e'; g.stroke();
  g.fillStyle = '#bc7af3'; g.shadowBlur = 14; g.shadowColor = '#af57f0';
  g.fillRect(51, 40, 8, 6); g.fillRect(70, 40, 8, 6); g.shadowBlur = 0;
  impostorTexture = new THREE.CanvasTexture(c); impostorTexture.colorSpace = THREE.SRGBColorSpace;
  return impostorTexture;
}
function setEnemyLOD(enemy, distance) {
  if (!enemy.alive) return;
  if (enemy.lod === '3d' && distance > 32) {
    enemy.renderMeshes.forEach(m => m.visible = false); enemy.aura.visible = false;
    enemy.sprite.visible = true; enemy.lod = '2d';
  } else if (enemy.lod === '2d' && distance < 26) {
    enemy.renderMeshes.forEach(m => m.visible = true); enemy.aura.visible = true;
    enemy.sprite.visible = false; enemy.lod = '3d';
  }
}
function onEnemyKilled(enemy) {
  enemy.alive = false; enemy.state = 'dead'; kills++;
  enemy.sprite.visible = false; enemy.renderMeshes.forEach(m => m.visible = true);
  enemy.deadTime = 0; enemy.deathStartX = enemy.group.rotation.x; enemy.deathStartY = enemy.group.position.y;
  enemy.group.traverse(obj => { if (obj.isMesh && obj !== enemy.sprite) {
    obj.material = obj.material.clone(); obj.material.color?.multiplyScalar(.55);
  }});
  if (missionPhase === 1 && enemies.filter(e => e.alive).length === 0) {
    missionPhase = 2; updateObjective('RESGATE O OPERADOR DE RÁDIO');
    showToast('ÁREA SEGURA', 'Os Errantes foram neutralizados. Procure o operador no abrigo.', 5);
    showRadio('Moretti: “Boa, Raul. O operador está junto ao abrigo improvisado. Vá buscá-lo.”', 5);
    playBeep(620, .16); captureCheckpoint(2);
  } else if (missionPhase === 4 && finalWaveSpawned && enemies.every(e => !e.alive)) {
    missionPhase = 5; gateOpening = true;
    updateObjective('ATRAVESSE O PORTÃO DO POSTO AVANÇADO');
    showRadio('Moretti: “A ameaça recuou! Abrindo o portão. Entre, Raul!”', 5);
    showToast('ACESSO LIBERADO', 'O portão está abrindo. Alcance a área de extração.', 5);
    captureCheckpoint(5); playBeep(750, .2);
  } else if (missionPhase === 1) updateObjective(`ELIMINE OS ERRANTES · ${kills} / 3`);
  else if (missionPhase === 4) updateObjective(`DEFENDA O POSTO · ${enemies.filter(e => e.alive).length} AMEAÇAS`);
}
function startFinalDefense() {
  if (missionPhase !== 3) return;
  missionPhase = 4; finalSpawnTimer = 2.3; finalWaveSpawned = false;
  updateObjective('PROTEJA O OPERADOR · PREPARE-SE');
  showToast('CONTATO NO POSTO', 'Novas criaturas surgiram perto do portão. Prepare-se para defender o rádio.', 6);
  showRadio('Operador: “O sinal está voltando... Não! Há algo se movendo na névoa!”', 5);
  playThreatSound();
}
function spawnFinalWave() {
  finalWaveSpawned = true;
  createEnemy(-11.4, -82, 3); createEnemy(11.4, -82, 4); createEnemy(-2.7, -92, 5, 'rastejador');
  updateObjective('DEFENDA O POSTO · 3 AMEAÇAS');
  showRadio('Moretti: “Rastejador à frente! Mire nas partes expostas e não deixe que o cerquem!”', 5);
  playThreatSound();
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
  ui.healthFill.style.background = health <= 30 ? '#d16b59' : '#c0a16c';
  const nearestAnomaly = janusAnomalies.length ? Math.min(...janusAnomalies.map(a =>
    Math.hypot(player.position.x - a.group.position.x, player.position.z - a.group.position.z))) : 100;
  const signalStrength = Math.max(0, 1 - nearestAnomaly / 9);
  $('janus-signal').classList.toggle('hidden', signalStrength < .1);
  $('janus-signal').style.opacity = String(.45 + signalStrength * .55);
  const loaded = currentWeapon === 'rifle' ? ammo : pistolAmmo;
  const stock = currentWeapon === 'rifle' ? reserveAmmo : pistolReserve;
  ui.ammo.textContent = String(loaded).padStart(2, '0'); ui.reserve.textContent = String(stock).padStart(2, '0');
  $('weapon-name').textContent = activeWeapon().label;
  $('weapon-slot').textContent = currentWeapon === 'rifle' ? '01 / FUZIL' : '02 / PISTOLA';
  $('secondary-weapon').textContent = currentWeapon === 'rifle'
    ? `2 PISTOLA · ${pistolAmmo}/${pistolReserve}` : `1 FUZIL · ${ammo}/${reserveAmmo}`;
  ui.compass.textContent = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'][Math.round((((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  ui.crosshair.classList.toggle('aimed', aiming); ui.crosshair.classList.toggle('hidden', !settings.crosshair);
  $('stamina-fill').style.width = `${Math.round(stamina)}%`;
  $('intel-count').textContent = intelFound ? '01 / 01' : '00 / 01';
  $('grenade-count').textContent = String(grenades);
  const movingSpeed = Math.hypot(player.velocity.x, player.velocity.z);
  const loudEvent = elapsedMission < loudNoiseUntil;
  const noiseLabel = loudEvent ? 'MUITO ALTO' : isCrouching ? 'BAIXO' : movingSpeed > 5.2 ? 'ALTO' : movingSpeed > .35 ? 'MÉDIO' : 'MÍNIMO';
  $('noise-value').textContent = noiseLabel;
  $('noise-status').dataset.level = noiseLabel.toLowerCase().replace(' ', '-');
  $('reload-progress').style.width = isReloading ? `${Math.round((1 - reloadTime / activeWeapon().reload) * 100)}%` : '0%';
  const target = missionPhase <= 1 ? { x: 0, z: -22 } : missionPhase === 2 ? { x: 4.7, z: -45.5 } : { x: 0, z: -99 };
  $('objective-distance').textContent = `${Math.round(Math.hypot(player.position.x - target.x, player.position.z - target.z))} m`;
  $('map-player').style.top = `${Math.max(8, Math.min(92, 92 - (28 - player.position.z) / 1.36))}%`;
  $('map-player').style.left = `${50 + player.position.x * 1.5}%`;
  const angleToTarget = Math.atan2(target.x - player.position.x, -(target.z - player.position.z));
  const delta = Math.atan2(Math.sin(angleToTarget - yaw), Math.cos(angleToTarget - yaw));
  $('objective-arrow').style.transform = `rotate(${delta}rad)`;
  $('objective-arrow').style.opacity = missionPhase === 1 || missionPhase === 4 ? '.25' : '1';
  $('escort-status').textContent = operatorRescued && missionPhase <= 4 && escortGroup?.visible
    ? `OPERADOR · ${Math.round(Math.hypot(player.position.x - escortGroup.position.x, player.position.z - escortGroup.position.z))} m` : '';
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
    if (operatorCollider) operatorCollider.disabled = true;
    escortGroup.position.set(4.7, 0, -45.5); escortGroup.visible = true;
    updateObjective('ESCOLTE O OPERADOR ATÉ O POSTO');
    showToast('OPERADOR RESGATADO', 'O operador vai acompanhar você. Não se afaste demais.', 5);
    showRadio('Operador: “Eles vieram da encosta. Não eram soldados. Preciso chegar ao posto para avisar a todos.”', 5.5);
    health = Math.max(60, health); captureCheckpoint(3); playBeep(740, .2);
  } else if (activeInteractable.type === 'pickup') {
    const p = activeInteractable.pickup;
    if (p.type === 'medkit' && health >= 100) { showToast('KIT MÉDICO', 'Sua vida já está cheia.', 2); return; }
    if (p.type === 'grenade' && grenades >= 3) { showToast('GRANADAS', 'Você já está no limite de granadas.', 2); return; }
    if (p.type === 'ammo' && reserveAmmo >= 80 && pistolReserve >= 96) { showToast('MUNIÇÃO', 'Sua reserva já está cheia.', 2); return; }
    p.used = true; p.group.visible = false;
    if (p.type === 'grenade') { grenades = Math.min(3, grenades + 2); showToast('GRANADAS', 'Duas granadas de fragmentação recebidas. Pressione G.', 3); }
    else if (p.type === 'medkit') { health = Math.min(100, health + 50); showToast('KIT MÉDICO', 'Condição física restaurada.', 2.5); }
    else if (p.type === 'intel') {
      intelFound = true;
      showToast('DOCUMENTO JANUS · 01/01', 'Transmissões impossíveis foram registradas nesta estrada.', 5);
      showRadio('Raul: “Um documento do Janus... fala de um sinal sob a montanha.”', 4);
    } else { reserveAmmo = Math.min(80, reserveAmmo + 24); pistolReserve = Math.min(96, pistolReserve + 12); showToast('MUNIÇÃO RECOLHIDA', 'Fuzil +24 · pistola +12 cartuchos.', 2.5); }
    updateHUD(); playBeep(650, .12);
  }
  activeInteractable = null; ui.interact.classList.add('hidden');
}
function showInfo(type) {
  infoReturnScreen = state === 'paused' ? ui.pause : ui.menu;
  const content = $('info-content');
  if (type === 'objectives') {
    content.innerHTML = `<div class="eyebrow"><i></i> ORDEM DE OPERAÇÃO</div><h3>OBJETIVOS E CONTROLES</h3><p><b>Missão:</b> Cinzas na Estrada.</p><p><b>Etapa atual:</b> ${ui.objective.textContent}.</p><ol><li>Avançar até o comboio destruído.</li><li>Eliminar os três Errantes da emboscada.</li><li>Resgatar o operador de rádio.</li><li>Escoltar o operador até o posto avançado.</li><li>Defender o posto e atravessar o portão.</li></ol><p><b>Documento opcional:</b> ${intelFound ? 'encontrado' : 'não encontrado'}.</p><div class="control-list"><div><span>Mover</span><kbd>W A S D</kbd></div><div><span>Olhar</span><kbd>MOUSE</kbd></div><div><span>Disparar</span><kbd>CLIQUE ESQ.</kbd></div><div><span>Mirar</span><kbd>CLIQUE DIR.</kbd></div><div><span>Correr</span><kbd>SHIFT</kbd></div><div><span>Agachar</span><kbd>CTRL</kbd></div><div><span>Pular</span><kbd>ESPAÇO</kbd></div><div><span>Interagir</span><kbd>E</kbd></div><div><span>Recarregar</span><kbd>R</kbd></div><div><span>Trocar arma</span><kbd>1 / 2 / RODA</kbd></div><div><span>Granada</span><kbd>G</kbd></div><div><span>Corpo a corpo</span><kbd>F</kbd></div><div><span>Lanterna</span><kbd>Q</kbd></div><div><span>Pausar</span><kbd>ESC</kbd></div></div>`;
  } else if (type === 'arsenal') {
    content.innerHTML = `<div class="eyebrow"><i></i> ARQUIVO DE CAMPO</div><h3>ARSENAL / BESTIÁRIO</h3><p><b>Fuzil semiautomático:</b> arma inicial de médio alcance. Carregador de 8 cartuchos, recarga manual e boa precisão quando o jogador controla o recuo.</p><p><b>Pistola de serviço:</b> arma secundária de 12 tiros, recarga rápida e menor dano. Pressione 2 ou use a roda do mouse para equipar; 1 retorna ao fuzil.</p><p><b>Errante:</b> criatura humanoide atraída por movimento e ruído. Ataca a curta distância; cabeça e núcleo violeta são vulneráveis.</p><p><b>Rastejador:</b> ameaça veloz, de silhueta baixa, encontrada perto do posto. Cuidado com o avanço rápido e a preparação do salto.</p><p><b>Equipamento:</b> granadas (G), golpe corpo a corpo (F), lanterna (Q), kit médico e caixas de munição podem ser encontrados no cenário. O arsenal completo será liberado ao longo da campanha.</p>`;
  } else if (type === 'controls') {
    content.innerHTML = `<div class="eyebrow"><i></i> MANUAL DO OPERADOR</div><h3>CONTROLES</h3><div class="control-list"><div><span>Mover</span><kbd>W A S D</kbd></div><div><span>Olhar</span><kbd>MOUSE</kbd></div><div><span>Disparar</span><kbd>CLIQUE ESQ.</kbd></div><div><span>Mirar</span><kbd>CLIQUE DIR.</kbd></div><div><span>Correr</span><kbd>SHIFT</kbd></div><div><span>Agachar</span><kbd>CTRL</kbd></div><div><span>Pular</span><kbd>ESPAÇO</kbd></div><div><span>Interagir</span><kbd>E</kbd></div><div><span>Recarregar</span><kbd>R</kbd></div><div><span>Trocar arma</span><kbd>1 / 2 / RODA</kbd></div><div><span>Granada</span><kbd>G</kbd></div><div><span>Corpo a corpo</span><kbd>F</kbd></div><div><span>Lanterna</span><kbd>Q</kbd></div><div><span>Pausar</span><kbd>ESC</kbd></div></div><p>O navegador solicita captura do mouse ao iniciar. Pressione ESC para abrir a pausa e liberar o cursor.</p>`;
  } else if (type === 'chapters') {
    content.innerHTML = `<div class="eyebrow"><i></i> CAMPANHA · 01 / 12</div><h3>SELEÇÃO DE CAPÍTULO</h3><p><b>01 — Cinzas na Estrada</b> · ${completedMission ? 'CONCLUÍDA' : 'NÃO CONCLUÍDA'}</p><p>02 — A Vila sem Sinos · EM DESENVOLVIMENTO</p><button id="replay-chapter" class="action-button">REJOGAR MISSÃO 01</button>`;
    $('replay-chapter').addEventListener('click', () => newCampaign());
  } else if (type === 'credits') {
    content.innerHTML = `<div class="eyebrow"><i></i> REGISTRO DE PRODUÇÃO</div><h3>CRÉDITOS</h3><p><b>OPERAÇÃO ECLIPSE: A GUERRA DOS ESQUECIDOS</b></p><p>Projeto original de campanha FPS em Three.js. Versão jogável da Missão 01 — 0.5.0.</p><p>Direção: ficção alternativa de guerra sobrenatural. Personagens, unidade, eventos e Projeto Janus são elementos ficcionais.</p><p>Este protótipo utiliza geometria procedural e áudio sintetizado; modelos, animações e trilha definitivos ainda serão produzidos.</p>`;
  } else if (type === 'options') {
    content.innerHTML = `<div class="eyebrow"><i></i> CONFIGURAÇÃO DO SISTEMA</div><h3>OPÇÕES</h3>
      <div class="option-row"><label for="opt-volume">VOLUME GERAL</label><input id="opt-volume" type="range" min="0" max="100" value="${settings.volume}"></div>
      <div class="option-row"><label for="opt-sensitivity">SENSIBILIDADE DO MOUSE</label><input id="opt-sensitivity" type="range" min="0.3" max="2.5" step="0.1" value="${settings.sensitivity}"></div>
      <div class="option-row"><label for="opt-fov">CAMPO DE VISÃO · FOV</label><input id="opt-fov" type="range" min="70" max="100" value="${settings.fov}"></div>
      <div class="option-row"><label for="opt-quality">QUALIDADE GRÁFICA</label><select id="opt-quality"><option value="baixo" ${settings.quality === 'baixo' ? 'selected' : ''}>Baixo</option><option value="equilibrado" ${settings.quality === 'equilibrado' ? 'selected' : ''}>Equilibrado</option><option value="alto" ${settings.quality === 'alto' ? 'selected' : ''}>Alto</option></select></div>
      <div class="option-row"><label for="opt-difficulty">DIFICULDADE</label><select id="opt-difficulty"><option value="recruta" ${settings.difficulty === 'recruta' ? 'selected' : ''}>Recruta</option><option value="soldado" ${settings.difficulty === 'soldado' ? 'selected' : ''}>Soldado</option><option value="veterano" ${settings.difficulty === 'veterano' ? 'selected' : ''}>Veterano</option><option value="pesadelo" ${settings.difficulty === 'pesadelo' ? 'selected' : ''}>Pesadelo</option></select></div>
      <div class="option-row"><label for="opt-fps">EXIBIR FPS</label><input id="opt-fps" type="checkbox" ${settings.showFPS ? 'checked' : ''}></div>
      <div class="option-row"><label for="opt-invert">INVERTER EIXO VERTICAL</label><input id="opt-invert" type="checkbox" ${settings.invertY ? 'checked' : ''}></div>
      <div class="option-row"><label for="opt-motion">REDUZIR BALANÇO DA CÂMERA</label><input id="opt-motion" type="checkbox" ${settings.reduceMotion ? 'checked' : ''}></div>
      <div class="option-row"><label for="opt-crosshair">EXIBIR MIRA CENTRAL</label><input id="opt-crosshair" type="checkbox" ${settings.crosshair ? 'checked' : ''}></div>
      <p>As opções são salvas neste navegador. Alterações de qualidade são aplicadas imediatamente; a dificuldade afeta inimigos criados em uma nova tentativa.</p>`;
    setTimeout(() => {
      $('opt-volume')?.addEventListener('input', e => { settings.volume = Number(e.target.value); saveSettings(); });
      $('opt-sensitivity')?.addEventListener('input', e => { settings.sensitivity = Number(e.target.value); saveSettings(); });
      $('opt-fov')?.addEventListener('input', e => { settings.fov = Number(e.target.value); camera.fov = settings.fov; camera.updateProjectionMatrix(); saveSettings(); });
      $('opt-quality')?.addEventListener('change', e => { settings.quality = e.target.value; applyQuality(); saveSettings(); });
      $('opt-difficulty')?.addEventListener('change', e => { settings.difficulty = e.target.value; saveSettings(); });
      $('opt-fps')?.addEventListener('change', e => { settings.showFPS = e.target.checked; saveSettings(); });
      $('opt-invert')?.addEventListener('change', e => { settings.invertY = e.target.checked; saveSettings(); });
      $('opt-motion')?.addEventListener('change', e => { settings.reduceMotion = e.target.checked; saveSettings(); });
      $('opt-crosshair')?.addEventListener('change', e => { settings.crosshair = e.target.checked; saveSettings(); });
    }, 0);
  }
  showScreen(ui.info);
}
function applyQuality() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.quality === 'baixo' ? 1 : 1.5));
  renderer.shadowMap.enabled = settings.quality === 'alto';
  if (sunLight) sunLight.castShadow = settings.quality === 'alto';
  applySceneryDensity(); applyRainQuality();
  if (dustField) dustField.geometry.setDrawRange(0, settings.quality === 'baixo' ? 50 : 115);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Campanha, checkpoints e estados. ----------
function resetMission() {
  enemies.forEach(disposeEnemy); enemies = [];
  grenadeProjectiles.forEach(g => { scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }); grenadeProjectiles = [];
  effects.filter(e => e.type !== 'smoke').forEach(e => { scene.remove(e.object); e.object.geometry?.dispose?.(); e.object.material?.dispose?.(); }); effects = effects.filter(e => e.type === 'smoke');
  kills = 0; shotsFired = 0; shotsHit = 0; elapsedMission = 0;
  noiseEvent = null; noiseEvents = []; noiseBurstTime = 0; loudNoiseUntil = 0; noiseSequence = 0; crosshairSpread = 5;
  if (escortGroup?.userData.navigation) escortGroup.userData.navigation = { path: null, pathIndex: 0, pathTimer: 0, pathGoal: -1 };
  health = 100; ammo = 8; reserveAmmo = 40; pistolAmmo = 12; pistolReserve = 36; currentWeapon = 'rifle'; grenades = 2; stamina = 100; intelFound = false; grenadeCooldown = 0; meleeCooldown = 0; reloadProgress = 0; cameraShake = 0;
  missionPhase = 0; operatorRescued = false; ambushTriggered = false; missionComplete = false;
  finalSpawnTimer = -1; finalWaveSpawned = false; gateOpening = false; gateOpen = false;
  isReloading = false; reloadTime = 0; fireCooldown = 0; aiming = false; muzzleTime = 0;
  ui.reload.textContent = ''; updateWeaponVisibility(); ui.radio.classList.add('hidden');
  warningTime = 0; damageDirectionTime = 0;
  $('threat-warning').classList.add('hidden'); $('damage-direction').classList.add('hidden'); ui.toast.classList.add('hidden');
  if (flashlight) { flashlight.intensity = 0; flashlight.userData.enabled = false; }
  if (operatorGroup) operatorGroup.visible = true;
  if (operatorCollider) operatorCollider.disabled = false;
  if (escortGroup) escortGroup.visible = false;
  if (outpostGate) { outpostGate.visible = true; outpostGate.position.y = 1.35; }
  pickups.forEach(p => { p.used = false; p.group.visible = true; });
  player.position.set(0, 1.7, 28); player.velocity.set(0,0,0); yaw = 0; pitch = 0; camera.rotation.set(0, 0, 0);
  camera.position.copy(player.position);
  keys = Object.create(null);
  updateObjective('AVANCE ATÉ O COMBOIO DESTRUÍDO'); updateHUD();
  captureCheckpoint(0);
}
function loadCheckpoint() {
  const cp = checkpoint || { x: 0, z: 28, health: 100, ammo: 8, reserve: 40, phase: 0 };
  const num = (value, fallback, min, max) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  player.position.set(num(cp.x, 0, -17, 17), 1.7, num(cp.z, 28, -101, 30));
  player.velocity.set(0,0,0); health = num(cp.health, 100, 1, 100); ammo = num(cp.ammo, 8, 0, 8);
  reserveAmmo = num(cp.reserve, 40, 0, 80);
  pistolAmmo = num(cp.pistolAmmo, 12, 0, 12);
  pistolReserve = num(cp.pistolReserve, 36, 0, 96);
  currentWeapon = WEAPONS[cp.currentWeapon] ? cp.currentWeapon : 'rifle';
  updateWeaponVisibility(); grenades = num(cp.grenades, 2, 0, 3); stamina = num(cp.stamina, 100, 0, 100);
  missionPhase = num(cp.phase, 0, 0, 5);
  operatorRescued = !!cp.operatorRescued; intelFound = !!cp.intelFound;
  kills = num(cp.kills, missionPhase >= 2 ? 3 : 0, 0, TOTAL_ENEMIES);
  shotsFired = num(cp.shotsFired, 0, 0, 100000);
  shotsHit = num(cp.shotsHit, 0, 0, shotsFired);
  elapsedMission = num(cp.elapsedMission, 0, 0, 86400);
  ambushTriggered = missionPhase >= 1;
  finalWaveSpawned = missionPhase >= 5;
  finalSpawnTimer = -1; gateOpening = missionPhase >= 5; gateOpen = false;
  missionComplete = false;
  isReloading = false; reloadTime = 0; fireCooldown = 0; aiming = false;
  ui.reload.textContent = '';
  if (operatorGroup) operatorGroup.visible = !operatorRescued;
  if (operatorCollider) operatorCollider.disabled = operatorRescued;
  if (escortGroup) {
    escortGroup.visible = operatorRescued;
    escortGroup.position.set(num(cp.x, 0, -17, 17) + 1, 0, num(cp.z, -45.5, -101, 30) + 1.7);
  }
  if (outpostGate) { outpostGate.visible = true; outpostGate.position.y = missionPhase >= 5 ? 5.5 : 1.35; }
  if (missionPhase >= 5) { gateOpen = true; gateOpening = false; }
  pickups.forEach((p, i) => {
    p.used = Array.isArray(cp.pickups) ? !!cp.pickups[i] : (p.type === 'intel' && intelFound);
    p.group.visible = !p.used;
  });
  enemies.forEach(disposeEnemy); enemies = [];
  grenadeProjectiles.forEach(g => { scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); }); grenadeProjectiles = []; grenadeCooldown = 0; meleeCooldown = 0;
  noiseEvent = null; noiseEvents = []; noiseBurstTime = 0; loudNoiseUntil = 0;
  if (escortGroup?.userData.navigation) escortGroup.userData.navigation = { path: null, pathIndex: 0, pathTimer: 0, pathGoal: -1 };
  if (missionPhase === 1) {
    createEnemy(-9.2, -34.5, 0); createEnemy(10.0, -36.5, 1); createEnemy(-1.0, -49.0, 2);
    kills = 0;
  } else if (missionPhase === 4) {
    finalWaveSpawned = true;
    createEnemy(-11.4, -82, 3); createEnemy(11.4, -82, 4); createEnemy(-2.7, -92, 5, 'rastejador');
  }
  updateObjective([
    'AVANCE ATÉ O COMBOIO DESTRUÍDO', 'ELIMINE OS ERRANTES · 0 / 3',
    'RESGATE O OPERADOR DE RÁDIO', 'ESCOLTE O OPERADOR ATÉ O POSTO',
    'DEFENDA O POSTO · 3 AMEAÇAS', 'ATRAVESSE O PORTÃO DO POSTO AVANÇADO'
  ][missionPhase]);
  keys = Object.create(null); updateHUD();
}
function newCampaign() {
  clearSave(); pendingContinue = false; resetMission();
  showScreen(ui.briefing); state = 'briefing';
}
function continueCampaign() {
  if (!savedGame || !savedGame.checkpoint) return;
  pendingContinue = true;
  checkpoint = { ...savedGame.checkpoint };
  settings.difficulty = savedGame.difficulty || settings.difficulty;
  showScreen(ui.briefing); state = 'briefing';
}
function beginGameplay() {
  initAudio();
  if (pendingContinue) loadCheckpoint(); else resetMission();
  pendingContinue = false;
  state = 'playing'; showScreen(null); ui.hud.classList.remove('hidden'); updateWeaponVisibility();
  camera.position.copy(player.position); camera.rotation.set(pitch, yaw, 0);
  requestLock();
  showToast('OBJETIVO', 'Avance pela estrada. WASD move, SHIFT corre, botão direito mira.', 6);
  showRadio('Moretti: “Raul, está ouvindo? O comboio parou de responder há seis minutos. Encontre o operador.”', 6);
}
function pauseGame() {
  if (state !== 'playing') return;
  state = 'paused'; showScreen(ui.pause); ui.pointerHint.classList.add('hidden');
  keys = Object.create(null); aiming = false; $('tactical-map').classList.add('hidden');
  intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
}
function resumeGame() {
  if (state !== 'paused') return;
  state = 'playing'; showScreen(null); requestLock();
}
function restartFromCheckpoint() {
  state = 'playing'; showScreen(null); loadCheckpoint(); updateWeaponVisibility(); ui.hud.classList.remove('hidden');
  requestLock();
}
function die() {
  health = 0; updateHUD(); state = 'dead'; showScreen(ui.death); ui.hud.classList.add('hidden');
  intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
}
function finishMission() {
  if (missionComplete || missionPhase !== 5 || !gateOpen) return;
  missionComplete = true; state = 'complete'; ui.hud.classList.add('hidden');
  $('result-kills').textContent = kills;
  $('result-accuracy').textContent = `${shotsFired ? Math.round(shotsHit / shotsFired * 100) : 0}%`;
  $('result-health').textContent = Math.round(health);
  $('result-time').textContent = `${String(Math.floor(elapsedMission / 60)).padStart(2, '0')}:${String(Math.floor(elapsedMission % 60)).padStart(2, '0')}`;
  $('result-intel').textContent = intelFound ? '01 / 01' : '00 / 01';
  completedMission = { version: 1, mission: '01', bestTime: Math.min(completedMission?.bestTime ?? Infinity, elapsedMission), intelFound: intelFound || !!completedMission?.intelFound };
  writeJSON(COMPLETION_KEY, completedMission);
  showScreen(ui.complete); intentionalUnlock = true; if (document.pointerLockElement) document.exitPointerLock();
  clearSave(); updateContinueButton(); playBeep(880, .35);
}

// ---------- Combate e movimentação. ----------
function canMoveTo(x, z) {
  if (x < -18 || x > 18 || z > 33 || z < -105) return false;
  if (z < -95.3 && (!gateOpen || Math.abs(x) > 5.5)) return false;
  for (const c of colliders) if (!c.disabled && Math.hypot(x - c.x, z - c.z) < c.r + player.radius) return false;
  return true;
}
function startReload() {
  if (state !== 'playing' || isReloading) return;
  const w = activeWeapon();
  const loaded = currentWeapon === 'rifle' ? ammo : pistolAmmo;
  const stock = currentWeapon === 'rifle' ? reserveAmmo : pistolReserve;
  if (loaded >= w.magSize || stock <= 0) return;
  isReloading = true; reloadTime = w.reload; ui.reload.textContent = 'RECARREGANDO'; playBeep(270, .06);
}
function finishReload() {
  const w = activeWeapon();
  if (currentWeapon === 'rifle') { const n = Math.min(w.magSize - ammo, reserveAmmo); ammo += n; reserveAmmo -= n; }
  else { const n = Math.min(w.magSize - pistolAmmo, pistolReserve); pistolAmmo += n; pistolReserve -= n; }
  isReloading = false; ui.reload.textContent = ''; updateHUD(); playBeep(410, .08);
}
function shoot() {
  if (state !== 'playing' || !pointerLocked || isReloading || fireCooldown > 0) return;
  const w = activeWeapon();
  const loaded = currentWeapon === 'rifle' ? ammo : pistolAmmo;
  if (loaded <= 0) { playBeep(130, .08); startReload(); return; }
  if (currentWeapon === 'rifle') ammo--; else pistolAmmo--;
  shotsFired++; fireCooldown = w.cadence; emitNoise(currentWeapon === 'rifle' ? 62 : 46, 'gunshot');
  crosshairSpread = Math.min(22, crosshairSpread + (aiming ? 2.5 : 6.5));
  recoil = Math.min(.15, recoil + w.kick); shotKick = 1;
  cameraShake = settings.reduceMotion ? 0 : (currentWeapon === 'rifle' ? .025 : .014);
  muzzleTime = .075;
  const flash = currentWeapon === 'rifle' ? muzzleFlash : pistolMuzzleFlash;
  flash.visible = true; flash.userData.light.intensity = currentWeapon === 'rifle' ? 4.5 : 3;
  updateHUD(); if (currentWeapon === 'rifle') playShotSound(); else playPistolSound();
  spawnCasing();
  const direction = new THREE.Vector3(); camera.getWorldDirection(direction);
  // Dispersão angular: ADS é mais precisa; movimento e corrida prejudicam tiro livre.
  const moving = Math.hypot(player.velocity.x, player.velocity.z);
  const spread = (aiming ? w.spreadADS : w.spreadHip) * (1 + (moving > 2 ? .65 : 0));
  const a = (rand() - .5) * 2 * spread, b = (rand() - .5) * 2 * spread;
  const rightX = Math.cos(yaw), rightZ = -Math.sin(yaw);
  direction.x += rightX * a;
  direction.z += rightZ * a;
  direction.y += b;
  direction.normalize();
  raycaster.set(camera.position, direction); raycaster.far = 65;
  // Obstáculos sólidos participam do raycast: sem tiros atravessando caminhões ou paredes.
  const targets = enemies.filter(e => e.alive).flatMap(e => e.hitMeshes);
  const intersections = raycaster.intersectObjects([...worldObstacles, ...targets], false);
  let end = camera.position.clone().add(direction.clone().multiplyScalar(55));
  if (intersections.length) {
    const hit = intersections[0]; end.copy(hit.point);
    const enemy = hit.object.userData.enemy;
    if (enemy && enemy.alive) {
      const headshot = hit.object.userData.part === 'head' || hit.object.userData.part === 'eye';
      const damage = headshot ? w.headDamage : w.damage;
      shotsHit++; applyEnemyDamage(enemy, damage, headshot);
      spawnImpact(hit.point, headshot ? 0xc99df3 : 0x756a7e, headshot ? 7 : 4);
    } else {
      spawnImpact(hit.point, 0x8e8571, 3);
      spawnBulletMark(hit.point);
    }
  }
  const lineGeo = new THREE.BufferGeometry().setFromPoints([camera.position.clone(), end]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xf2c27a, transparent: true, opacity: .75 }));
  scene.add(line); effects.push({ type: 'tracer', object: line, life: .055 });
}
function applyEnemyDamage(enemy, amount, headshot = false) {
  if (!enemy.alive) return;
  enemy.health -= amount;
  enemy.stagger = headshot ? .35 : .14;
  enemy.attackPulse = .22;
  hitTime = .16; ui.hit.classList.remove('hidden');
  ui.hit.classList.toggle('critical', headshot);
  if (enemy.health <= 0) onEnemyKilled(enemy);
}
function spawnCasing() {
  if (effects.filter(e => e.type === 'casing').length >= 16) return;
  const mesh = addMesh(new THREE.CylinderGeometry(.025, .025, .1, 6),
    new THREE.MeshStandardMaterial({ color: 0xb89a61, metalness: .75, roughness: .38 }), scene,
    player.position.x + Math.cos(yaw) * .24, player.position.y - .22, player.position.z - Math.sin(yaw) * .24);
  effects.push({ type: 'casing', object: mesh, life: 1.7,
    velocity: new THREE.Vector3(Math.cos(yaw) * (1.8 + rand()), 2.5 + rand(), -Math.sin(yaw) * (1.8 + rand())) });
}
function getImpactTexture() {
  if (impactTexture) return impactTexture;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 1, 32, 32, 29);
  gradient.addColorStop(0, 'rgba(13,12,11,.92)');
  gradient.addColorStop(.27, 'rgba(26,25,23,.85)');
  gradient.addColorStop(.45, 'rgba(63,57,47,.45)');
  gradient.addColorStop(1, 'rgba(63,57,47,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,64,64);
  impactTexture = new THREE.CanvasTexture(c);
  return impactTexture;
}
function spawnBulletMark(point) {
  if (effects.filter(e => e.type === 'bulletMark').length >= 28) return;
  const material = new THREE.SpriteMaterial({ map: getImpactTexture(), transparent: true, depthWrite: false, opacity: .8 });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(point); sprite.position.y += .012;
  sprite.scale.set(.22, .22, 1); scene.add(sprite);
  effects.push({ type: 'bulletMark', object: sprite, life: 6 });
}
function spawnImpact(point, color = 0xc7b9a0, count = 5) {
  if (effects.length > 95) return;
  const shared = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85, depthWrite: false });
  for (let i = 0; i < count; i++) {
    const mesh = addMesh(new THREE.TetrahedronGeometry(.045 + rand() * .045), shared.clone(), scene, point.x, point.y, point.z);
    effects.push({ type: 'particle', object: mesh, life: .25 + rand() * .25,
      velocity: new THREE.Vector3((rand() - .5) * 3, rand() * 2.4, (rand() - .5) * 3) });
  }
  shared.dispose();
}
function meleeAttack() {
  if (state !== 'playing' || !pointerLocked || meleeCooldown > 0) return;
  meleeCooldown = .7; meleeTime = .3; playMeleeSound();
  const forward = new THREE.Vector3(); camera.getWorldDirection(forward);
  const candidates = enemies.filter(e => e.alive).map(e => ({ e, dx: e.group.position.x - player.position.x, dz: e.group.position.z - player.position.z }));
  let target = null, best = 2.35;
  for (const item of candidates) {
    const d = Math.hypot(item.dx, item.dz);
    if (d >= best || (item.dx * forward.x + item.dz * forward.z) / Math.max(.01, d) < .52) continue;
    const direction = new THREE.Vector3(item.dx, 0, item.dz).normalize();
    raycaster.set(new THREE.Vector3(player.position.x, 1.15, player.position.z), direction); raycaster.far = Math.max(.01, d - .3);
    if (raycaster.intersectObjects(worldObstacles, false).length) continue;
    target = item.e; best = d;
  }
  if (target) { applyEnemyDamage(target, 35); spawnImpact(target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x9573a9, 4); }
}
function throwGrenade() {
  if (state !== 'playing' || !pointerLocked || grenades <= 0 || grenadeCooldown > 0) return;
  grenades--; grenadeCooldown = .7; emitNoise(42, 'grenade'); updateHUD(); playBeep(240, .08);
  const direction = new THREE.Vector3(); camera.getWorldDirection(direction);
  const mesh = addMesh(new THREE.SphereGeometry(.16, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x59634e, roughness: .7, metalness: .4 }), scene,
    player.position.x + direction.x * .8, player.position.y - .18, player.position.z + direction.z * .8);
  grenadeProjectiles.push({ mesh, velocity: direction.multiplyScalar(12).add(new THREE.Vector3(0, 4.8, 0)), fuse: 2.1 });
}
function explodeGrenade(grenade) {
  const p = grenade.mesh.position.clone(); emitNoise(72, 'explosion', p.x, p.z); playExplosionSound();
  if (!settings.reduceMotion) cameraShake = Math.max(cameraShake, Math.max(0, .12 - p.distanceTo(camera.position) * .003));
  spawnImpact(p, 0xffae65, settings.quality === 'baixo' ? 8 : 18);
  const blast = addMesh(new THREE.SphereGeometry(.9, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf4a65b, transparent: true, opacity: .45, depthWrite: false }), scene, p.x, p.y, p.z);
  effects.push({ type: 'blast', object: blast, life: .27 });
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const d = Math.hypot(enemy.group.position.x - p.x, enemy.group.position.z - p.z);
    if (d < 5.2) {
      const target = enemy.group.position.clone().add(new THREE.Vector3(0, 1.15, 0));
      const dir = target.clone().sub(p); raycaster.set(p, dir.clone().normalize()); raycaster.far = Math.max(.01, dir.length() - .3);
      if (!raycaster.intersectObjects(worldObstacles, false).length) applyEnemyDamage(enemy, Math.round(95 * (1 - d / 7)));
    }
  }
  const selfDistance = Math.hypot(player.position.x - p.x, player.position.z - p.z);
  if (selfDistance < 3.5) damagePlayer(Math.round(24 * (1 - selfDistance / 3.5)));
}
function updateGrenades(dt) {
  for (let i = grenadeProjectiles.length - 1; i >= 0; i--) {
    const g = grenadeProjectiles[i]; g.fuse -= dt;
    const old = g.mesh.position.clone();
    g.velocity.y -= 15 * dt;
    const next = old.clone().addScaledVector(g.velocity, dt);
    if (next.y < .17) { next.y = .17; g.velocity.y = Math.abs(g.velocity.y) * .35; g.velocity.x *= .7; g.velocity.z *= .7; }
    if (!canMoveTo(next.x, next.z)) { g.velocity.x *= -.25; g.velocity.z *= -.25; next.x = old.x; next.z = old.z; }
    g.mesh.position.copy(next); g.mesh.rotation.x += dt * 8; g.mesh.rotation.z += dt * 5;
    if (g.fuse <= 0) { explodeGrenade(g); scene.remove(g.mesh); g.mesh.geometry.dispose(); g.mesh.material.dispose(); grenadeProjectiles.splice(i, 1); }
  }
}

function damagePlayer(amount, source = null) {
  if (source && state === 'playing') {
    const dx = source.x - player.position.x, dz = source.z - player.position.z;
    const angle = Math.atan2(dx, -dz) - yaw;
    $('damage-direction').style.transform = `translate(-50%,-50%) rotate(${angle}rad)`;
    $('damage-direction').classList.remove('hidden'); damageDirectionTime = .7;
  }
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
  const sprinting = moving && (keys.ShiftLeft || keys.ShiftRight) && !isCrouching && !aiming && stamina > 1;
  stamina = Math.min(100, Math.max(0, stamina + (sprinting ? -22 : 17) * dt));
  const speed = isCrouching ? 2.15 : sprinting ? 7.0 : 4.7;
  if (moving && grounded) { stepsTimer -= dt; if (stepsTimer <= 0) {
    playStepSound(); emitNoise(isCrouching ? 2.8 : sprinting ? 18 : 8.5, isCrouching ? 'crouch' : sprinting ? 'sprint' : 'footstep');
    stepsTimer = sprinting ? .32 : isCrouching ? .68 : .48;
  }} else stepsTimer = 0;
  // Aceleração e atrito: movimento não inicia nem para instantaneamente.
  const response = moving ? (grounded ? 13 : 4.5) : (grounded ? 16 : 2.5);
  player.velocity.x += (wish.x * speed - player.velocity.x) * Math.min(1, dt * response);
  player.velocity.z += (wish.z * speed - player.velocity.z) * Math.min(1, dt * response);
  const dx = player.velocity.x * dt; const dz = player.velocity.z * dt;
  const nextX = player.position.x + dx; if (canMoveTo(nextX, player.position.z)) player.position.x = nextX; else player.velocity.x = 0;
  const nextZ = player.position.z + dz; if (canMoveTo(player.position.x, nextZ)) player.position.z = nextZ; else player.velocity.z = 0;
  if (keys.Space && grounded && !isCrouching) { jumpVelocity = 5.2; grounded = false; }
  if (!grounded) { player.position.y += jumpVelocity * dt; jumpVelocity -= 13.5 * dt; if (player.position.y <= (isCrouching ? 1.05 : 1.7)) { player.position.y = isCrouching ? 1.05 : 1.7; jumpVelocity = 0; grounded = true; } }
  const targetHeight = isCrouching ? 1.08 : 1.7;
  if (grounded) player.position.y += (targetHeight - player.position.y) * Math.min(1, dt * 10);
  camera.position.copy(player.position);
  camera.rotation.set(pitch - recoil + (settings.reduceMotion ? 0 : (rand() - .5) * cameraShake), yaw + (settings.reduceMotion ? 0 : (rand() - .5) * cameraShake), 0);
  cameraShake = Math.max(0, cameraShake - dt * .12);
  const targetFov = aiming ? Math.max(55, settings.fov - 20) : settings.fov;
  camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 12); camera.updateProjectionMatrix();
  const crosshairTarget = (aiming ? 3.2 : 6.5) + (moving ? Math.min(5, Math.hypot(player.velocity.x, player.velocity.z) * .55) : 0);
  crosshairSpread += (crosshairTarget - crosshairSpread) * Math.min(1, dt * 8);
  ui.crosshair.style.setProperty('--spread', `${crosshairSpread.toFixed(1)}px`);
  const bob = moving && !settings.reduceMotion ? Math.sin(elapsedMission * (sprinting ? 13 : 9)) * (sprinting ? .012 : .007) : 0;
  const gun = activeWeaponGroup();
  const targetWeaponPos = currentWeapon === 'rifle'
    ? (aiming ? new THREE.Vector3(0, -.245, -.48) : new THREE.Vector3(.38, -.34 + bob, -.58))
    : (aiming ? new THREE.Vector3(0, -.235, -.41) : new THREE.Vector3(.29, -.36 + bob, -.48));
  targetWeaponPos.z += shotKick * .12;
  if (isReloading) { const phase = 1 - reloadTime / activeWeapon().reload; targetWeaponPos.y -= Math.sin(phase * Math.PI) * .19; targetWeaponPos.x += Math.sin(phase * Math.PI) * .12; }
  if (meleeTime > 0) targetWeaponPos.z -= Math.sin(meleeTime / .3 * Math.PI) * .32;
  gun.position.lerp(targetWeaponPos, Math.min(1, dt * 12));
  gun.rotation.z += ((moving ? Math.sin(elapsedMission * 8) * .012 : 0) - gun.rotation.z) * Math.min(1, dt * 9);
  recoil = Math.max(0, recoil - dt * .42); shotKick = Math.max(0, shotKick - dt * 7);
  meleeCooldown = Math.max(0, meleeCooldown - dt); meleeTime = Math.max(0, meleeTime - dt); grenadeCooldown = Math.max(0, grenadeCooldown - dt);
  if (fireCooldown > 0) fireCooldown -= dt;
  if (muzzleTime > 0) { muzzleTime -= dt; if (muzzleTime <= 0) {
    muzzleFlash.visible = false; muzzleFlash.userData.light.intensity = 0;
    pistolMuzzleFlash.visible = false; pistolMuzzleFlash.userData.light.intensity = 0;
  }}
  if (isReloading) { reloadTime -= dt; if (reloadTime <= 0) finishReload(); }
  if (missionPhase === 0 && player.position.z < -8) {
    missionPhase = 1; updateObjective('ELIMINE OS ERRANTES · 0 / 3'); triggerAmbush();
  }
  updateEscort(dt); updateGrenades(dt);
  if (missionPhase === 3 && player.position.z < -78 && escortGroup.position.z < -72) startFinalDefense();
  if (missionPhase === 4 && !finalWaveSpawned) {
    finalSpawnTimer -= dt;
    if (finalSpawnTimer <= 0) spawnFinalWave();
  }
  if (gateOpening && outpostGate) {
    outpostGate.position.y = Math.min(5.5, outpostGate.position.y + dt * 1.75);
    if (outpostGate.position.y >= 5.5) { gateOpening = false; gateOpen = true; }
  }
  if (missionPhase === 5 && gateOpen && player.position.z < -99 && Math.abs(player.position.x) < 5.5) finishMission();
  if (player.position.z < -17 && !ambushTriggered) triggerAmbush();
  updateInteractPrompt();
}
function updateEscort(dt) {
  if (!operatorRescued || !escortGroup?.visible || missionPhase >= 5) return;
  const followX = missionPhase === 4 ? 3.8 : player.position.x + Math.sin(yaw) * 2.2;
  const followZ = missionPhase === 4 ? -76.5 : player.position.z + Math.cos(yaw) * 2.2;
  const dx = followX - escortGroup.position.x, dz = followZ - escortGroup.position.z;
  const distance = Math.hypot(dx, dz);
  if (distance > 1.35) {
    const nav = escortGroup.userData.navigation || (escortGroup.userData.navigation = { path: null, pathIndex: 0, pathTimer: 0, pathGoal: -1 });
    const waypoint = navigationTarget(nav, escortGroup.position.x, escortGroup.position.z, followX, followZ, .28, dt);
    const wx = waypoint.x - escortGroup.position.x, wz = waypoint.z - escortGroup.position.z;
    const waypointDistance = Math.hypot(wx, wz);
    const speed = distance > 9 ? 5.5 : 3.45;
    const step = Math.min(Math.max(0, waypointDistance - .18), speed * dt);
    if (waypointDistance > .01 && step > 0) {
      const nx = escortGroup.position.x + wx / waypointDistance * step;
      const nz = escortGroup.position.z + wz / waypointDistance * step;
      if (!enemyBlocked(nx, nz, .25)) escortGroup.position.set(nx, 0, nz);
    }
    escortGroup.rotation.y = Math.atan2(dx, dz) + Math.PI;
    escortGroup.userData.walkTime += dt;
    escortGroup.position.y = settings.reduceMotion ? 0 : Math.abs(Math.sin(escortGroup.userData.walkTime * 8)) * .025;
  }
}
function enemyHasLineOfSight(enemy) {
  const from = enemy.group.position.clone().add(new THREE.Vector3(0, 1.25, 0));
  const toward = camera.position.clone().sub(from);
  const distance = toward.length();
  if (distance < .01) return true;
  raycaster.set(from, toward.normalize()); raycaster.far = Math.max(.01, distance - .4);
  return raycaster.intersectObjects(worldObstacles, false).length === 0;
}
function updateEnemies(dt) {
  if (state !== 'playing') return;
  for (const e of enemies) {
    if (!e.alive) {
      e.deadTime += dt;
      const fall = Math.min(1, e.deadTime / .48);
      const eased = fall * fall * (3 - 2 * fall);
      e.group.rotation.x = e.deathStartX - 1.22 * eased;
      e.group.position.y = e.deathStartY * (1 - eased) + .1 * eased;
      e.group.scale.y = e.baseScale.y * (1 - .48 * eased);
      continue;
    }
    const px = player.position.x, pz = player.position.z;
    let dx = px - e.group.position.x, dz = pz - e.group.position.z;
    let distance = Math.hypot(dx, dz);
    setEnemyLOD(e, distance);
    e.attackPulse = Math.max(0, e.attackPulse - dt);
    e.aura.intensity = e.attackPulse > 0 ? 1.8 : .7;

    // Percepção: visão perde alcance quando Raul está agachado; tiros e passos geram ruído.
    const sightRange = isCrouching ? 18 : 34;
    const seesPlayer = distance <= sightRange && enemyHasLineOfSight(e);
    if (seesPlayer) {
      e.lastKnownX = px; e.lastKnownZ = pz; e.lastSeenAt = elapsedMission;
    }
    for (const noise of noiseEvents) {
      if (noise.id <= e.heardNoiseId) continue;
      const noiseDistance = Math.hypot(noise.x - e.group.position.x, noise.z - e.group.position.z);
      if (elapsedMission - noise.time < 2.2 && noiseDistance <= noise.radius) {
        e.lastKnownX = noise.x; e.lastKnownZ = noise.z; e.lastHeardAt = elapsedMission;
      }
      e.heardNoiseId = noise.id;
    }
    const memoryAge = elapsedMission - Math.max(e.lastSeenAt, e.lastHeardAt);
    const hasTarget = seesPlayer || memoryAge < 4.8;
    const targetX = seesPlayer ? px : e.lastKnownX;
    const targetZ = seesPlayer ? pz : e.lastKnownZ;
    const targetDx = targetX - e.group.position.x, targetDz = targetZ - e.group.position.z;
    const targetDistance = Math.hypot(targetDx, targetDz);
    if (hasTarget) e.group.rotation.y = Math.atan2(targetDx, targetDz) + Math.PI;
    else e.group.rotation.y += Math.sin(elapsedMission * 1.7 + e.phase) * dt * .55;

    const stride = Math.sin(elapsedMission * (e.type === 'rastejador' ? 13 : 8) + e.phase);
    const movingAnim = hasTarget && targetDistance > 1.1 && e.state !== 'windup' && e.state !== 'recover';
    e.legs.forEach((leg, i) => { leg.rotation.x = movingAnim ? stride * (i ? -1 : 1) * .38 : 0; });
    e.arms.forEach((arm, i) => { arm.rotation.x = e.state === 'windup' ? -.8 : movingAnim ? stride * (i ? 1 : -1) * .32 : 0; });
    if (e.stagger > 0) { e.stagger -= dt; continue; }

    if (e.state === 'windup') {
      e.aura.intensity = 2.5; e.windup -= dt;
      e.group.scale.x = e.baseScale.x * (1 + .1 * Math.sin(Math.max(0, e.windup) * 35));
      if (e.windup <= 0) {
        if (e.type === 'rastejador' && seesPlayer) {
          const len = Math.max(.001, distance);
          e.lungeDirX = dx / len; e.lungeDirZ = dz / len;
          e.lungeTime = .25; e.state = 'lunge';
        } else {
          if (seesPlayer && distance < 1.95 && enemyHasLineOfSight(e)) damagePlayer(e.damage, e.group.position);
          e.state = 'recover'; e.recover = 1.05;
          e.aura.intensity = .8; e.group.scale.x = e.baseScale.x;
        }
      }
      continue;
    }
    if (e.state === 'lunge') {
      e.lungeTime -= dt;
      const leapStep = Math.min(e.speed * 4.2 * dt, 1.15 * dt / .25);
      const nx = e.group.position.x + e.lungeDirX * leapStep;
      const nz = e.group.position.z + e.lungeDirZ * leapStep;
      if (!enemyBlocked(nx, nz, .32)) { e.group.position.x = nx; e.group.position.z = nz; }
      e.group.position.y = Math.max(0, Math.sin((.25 - Math.max(0, e.lungeTime)) / .25 * Math.PI) * .28);
      if (e.lungeTime <= 0) {
        const finalDistance = Math.hypot(px - e.group.position.x, pz - e.group.position.z);
        if (finalDistance < 2.35 && enemyHasLineOfSight(e)) damagePlayer(e.damage, e.group.position);
        e.group.position.y = 0; e.state = 'recover'; e.recover = .95;
      }
      continue;
    }
    if (e.state === 'recover') { e.recover -= dt; if (e.recover <= 0) e.state = hasTarget ? 'chase' : 'search'; continue; }

    if (seesPlayer && distance <= (e.type === 'rastejador' ? 2.15 : 1.7)) {
      e.state = 'windup'; e.windup = e.type === 'rastejador' ? .58 : .68;
      if (distance < 4.2) {
        $('threat-warning').textContent = e.type === 'rastejador' ? '⚠ RASTEJADOR PREPARANDO INVESTIDA' : '⚠ ATAQUE IMINENTE';
        $('threat-warning').classList.remove('hidden'); warningTime = 1.0;
      }
      playThreatSound(); continue;
    }
    if (!hasTarget) { e.state = 'search'; continue; }
    e.state = seesPlayer ? 'chase' : 'investigate';
    if (targetDistance > .12) {
      const waypoint = navigationTarget(e, e.group.position.x, e.group.position.z, targetX, targetZ, .34, dt);
      const mx = waypoint.x - e.group.position.x, mz = waypoint.z - e.group.position.z;
      const moveDistance = Math.hypot(mx, mz);
      if (moveDistance > .04) {
        const step = Math.min(e.speed * dt * (seesPlayer ? 1 : .82), moveDistance);
        const nx = e.group.position.x + mx / moveDistance * step;
        const nz = e.group.position.z + mz / moveDistance * step;
        if (!enemyBlocked(nx, nz, .32)) { e.group.position.x = nx; e.group.position.z = nz; }
      }
      // Separação suave evita sobreposição e mantém corredores de passagem.
      for (const other of enemies) {
        if (other === e || !other.alive) continue;
        const sx = e.group.position.x - other.group.position.x;
        const sz = e.group.position.z - other.group.position.z;
        const separation = Math.hypot(sx, sz);
        if (separation > .01 && separation < .9) {
          const push = Math.min(.12, (.9 - separation) * dt * 2.6);
          const nx = e.group.position.x + sx / separation * push;
          const nz = e.group.position.z + sz / separation * push;
          if (!enemyBlocked(nx, nz, .3)) { e.group.position.x = nx; e.group.position.z = nz; }
        }
      }
      e.group.position.y = Math.abs(Math.sin(elapsedMission * 7 + e.phase)) * .045;
    }
  }
}

function enemyBlocked(x, z, radius = .35) {
  if (x < -17.5 || x > 17.5 || z < -95 || z > 33) return true;
  for (const c of colliders) if (!c.disabled && Math.hypot(x - c.x, z - c.z) < c.r + radius) return true;
  return false;
}
function updateEffects(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    if (e.type === 'smoke') { e.phase = (e.phase + dt) % 100; e.object.position.y = e.baseY + Math.sin(e.phase * .65) * .25; e.object.material.opacity = .15 + (Math.sin(e.phase * .4) + 1) * .05; continue; }
    e.life -= dt;
    if (e.type === 'tracer') e.object.material.opacity = Math.max(0, e.life / .055) * .75;
    if (e.type === 'particle') { e.velocity.y -= dt * 8; e.object.position.addScaledVector(e.velocity, dt); e.object.material.opacity = Math.min(.9, e.life * 2); }
    if (e.type === 'blast') { e.object.scale.setScalar(1 + (.27 - e.life) * 11); e.object.material.opacity = Math.max(0, e.life / .27 * .45); }
    if (e.type === 'casing') {
      e.velocity.y -= dt * 10;
      e.object.position.addScaledVector(e.velocity, dt);
      e.object.rotation.x += dt * 14; e.object.rotation.z += dt * 9;
      if (e.object.position.y < .055) { e.object.position.y = .055; e.velocity.y = Math.abs(e.velocity.y) * .18; e.velocity.x *= .72; e.velocity.z *= .72; }
    }
    if (e.type === 'bulletMark') e.object.material.opacity = Math.min(.8, e.life / 1.8);
    if (e.life <= 0) { scene.remove(e.object); e.object.geometry?.dispose?.(); e.object.material?.dispose?.(); effects.splice(i, 1); }
  }
  if (dustField) dustField.rotation.y += dt * .006;
  updateRain(dt);
  for (const a of janusAnomalies) {
    a.phase += dt; a.group.position.y = a.baseY + Math.sin(a.phase * 1.4) * .11;
    a.ring.rotation.z += dt * .27;
  }
  noiseBurstTime = Math.max(0, noiseBurstTime - dt);
  noiseEvents = noiseEvents.filter(noise => elapsedMission - noise.time < 2.3);
  if (damageFlashTime > 0) { damageFlashTime -= dt; ui.damage.style.opacity = String(Math.max(0, damageFlashTime / .22) * .85); }
  if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) ui.toast.classList.add('hidden'); }
  if (radioTime > 0) { radioTime -= dt; if (radioTime <= 0) ui.radio.classList.add('hidden'); }
  if (hitTime > 0) { hitTime -= dt; if (hitTime <= 0) { ui.hit.classList.add('hidden'); ui.hit.classList.remove('critical'); } }
  if (saveIndicatorTime > 0) { saveIndicatorTime -= dt; if (saveIndicatorTime <= 0) $('save-indicator').classList.add('hidden'); }
  if (warningTime > 0) { warningTime -= dt; if (warningTime <= 0) $('threat-warning').classList.add('hidden'); }
  if (damageDirectionTime > 0) { damageDirectionTime -= dt; if (damageDirectionTime <= 0) $('damage-direction').classList.add('hidden'); }
}
function updateGame(dt) {
  if (state !== 'playing') return;
  elapsedMission += dt;
  if (sunLight && settings.quality === 'alto') {
    shadowUpdateTime -= dt;
    if (shadowUpdateTime <= 0) {
      sunLight.position.set(player.position.x - 28, 42, player.position.z + 22);
      sunLight.target.position.set(player.position.x, 0, player.position.z);
      sunLight.target.updateMatrixWorld(); shadowUpdateTime = .2;
    }
  }
  updatePlayer(dt); updateEnemies(dt); updateEffects(dt); updateHUD();
  weatherClock += dt;
  if (weatherClock > .25) {
    scene.fog.density += ((missionPhase === 1 || missionPhase === 4 ? .013 : .0105) - scene.fog.density) * .08;
    weatherClock = 0;
  }
  if (debugVisible) {
    const stats = renderer.info.render;
    $('performance-overlay').textContent = `DRAW CALLS ${stats.calls} · TRIÂNGULOS ${stats.triangles} · IA ${enemies.filter(e => e.alive).length} · ${settings.quality.toUpperCase()}`;
  }
  if (settings.showFPS) {
    fpsFrames++; fpsTimer += dt;
    if (fpsTimer > .5) { fpsValue = Math.round(fpsFrames / fpsTimer); fpsFrames = 0; fpsTimer = 0; ui.fps.textContent = `${fpsValue} FPS`; ui.fps.classList.remove('hidden'); }
  }
}

// ---------- Entrada e ciclo principal. ----------
function onMouseMove(event) {
  if (!pointerLocked || state !== 'playing') return;
  const scale = .0022 * settings.sensitivity * (aiming ? .65 : 1);
  yaw -= event.movementX * scale; pitch += event.movementY * scale * (settings.invertY ? 1 : -1);
  pitch = Math.max(-1.42, Math.min(1.42, pitch));
}
function requestLock() {
  if (state === 'playing' && !document.pointerLockElement) {
    try { canvas.requestPointerLock(); } catch { ui.pointerHint.classList.remove('hidden'); }
  }
}
function handleKeyDown(e) {
  if (['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && state === 'playing') e.preventDefault();
  if (state !== 'playing' && e.code !== 'Escape') return;
  keys[e.code] = true;
  if (e.code === 'Escape') { if (state === 'playing') pauseGame(); else if (state === 'paused') resumeGame(); }
  if (e.code === 'F3' && !e.repeat) {
    e.preventDefault(); debugVisible = !debugVisible;
    $('performance-overlay').classList.toggle('hidden', !debugVisible);
  }
  if (e.code === 'Digit1' && !e.repeat) switchWeapon('rifle');
  if (e.code === 'Digit2' && !e.repeat) switchWeapon('pistol');
  if (e.code === 'KeyE' && !e.repeat) interact();
  if (e.code === 'KeyR' && !e.repeat) startReload();
  if (e.code === 'KeyF' && !e.repeat) meleeAttack();
  if (e.code === 'KeyG' && !e.repeat) throwGrenade();
  if (e.code === 'KeyQ' && !e.repeat && state === 'playing' && flashlight) { flashlight.userData.enabled = !flashlight.userData.enabled; flashlight.intensity = flashlight.userData.enabled ? 7 : 0; playBeep(480, .08); }
  if (e.code === 'Tab' && state === 'playing') { e.preventDefault(); $('tactical-map').classList.remove('hidden'); }
}
function handleKeyUp(e) { keys[e.code] = false; if (e.code === 'Tab') $('tactical-map').classList.add('hidden'); }
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04);
  if (state === 'menu' || state === 'briefing') {
    if (rainField) rainField.visible = false;
    const t = performance.now() * .00008; camera.position.set(15 + Math.sin(t) * 1.2, 10 + Math.sin(t * .7) * .25, 22); camera.lookAt(0, 1.5, -35);
    updateEffects(dt);
  } else if (state === 'playing') updateGame(dt);
  if (!settings.showFPS) ui.fps.classList.add('hidden');
  if (skyDome) skyDome.position.copy(camera.position);
  renderer.render(scene, camera);
}

// ---------- Eventos de interface. ----------
$('new-game-btn').addEventListener('click', () => { if (savedGame && !window.confirm('Iniciar nova campanha? O checkpoint atual será substituído.')) return; initAudio(); newCampaign(); });
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
$('pause-menu-btn').addEventListener('click', () => { if (flashlight) { flashlight.intensity = 0; flashlight.userData.enabled = false; } state = 'menu'; ui.hud.classList.add('hidden'); updateWeaponVisibility(); showScreen(ui.menu); updateContinueButton(); });
$('retry-btn').addEventListener('click', restartFromCheckpoint);
$('death-menu-btn').addEventListener('click', () => { if (flashlight) { flashlight.intensity = 0; flashlight.userData.enabled = false; } state = 'menu'; updateWeaponVisibility(); showScreen(ui.menu); updateContinueButton(); });
$('complete-menu-btn').addEventListener('click', () => { if (flashlight) { flashlight.intensity = 0; flashlight.userData.enabled = false; } state = 'menu'; updateWeaponVisibility(); showScreen(ui.menu); updateContinueButton(); });
canvas.addEventListener('click', () => { if (state === 'playing' && !pointerLocked) requestLock(); });
canvas.addEventListener('wheel', e => {
  if (state === 'playing') { e.preventDefault(); switchWeapon(currentWeapon === 'rifle' ? 'pistol' : 'rifle'); }
}, { passive: false });
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
  ui.loadingFill.style.width = '46%'; ui.loadingStatus.textContent = 'CALCULANDO ROTAS DE NAVEGAÇÃO';
  buildNavigationGrid();
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
