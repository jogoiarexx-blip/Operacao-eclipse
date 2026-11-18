// Smoke test sem dependências: executa o fluxo de missão com um simulador mínimo de Three.js/DOM.
// Não substitui um teste gráfico em Chromium/WebGL.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const ids = new Set([...html.matchAll(/id="([\w-]+)"/g), ...source.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
for (const [, id] of source.matchAll(/\$\('([\w-]+)'\)/g)) assert.ok(ids.has(id), `HTML sem id ${id}`);

class Vector {
  constructor(x = 0, y = 0, z = 0) { this.set(x,y,z); }
  set(x=0,y=0,z=0) { this.x=x; this.y=y; this.z=z; return this; }
  setScalar(s) { return this.set(s,s,s); }
  clone() { return new Vector(this.x,this.y,this.z); }
  copy(v) { return this.set(v.x,v.y,v.z); }
  add(v) { this.x+=v.x;this.y+=v.y;this.z+=v.z;return this; }
  addScaledVector(v,s) { this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this; }
  multiplyScalar(s) { this.x*=s;this.y*=s;this.z*=s;return this; }
  lengthSq() { return this.x*this.x+this.y*this.y+this.z*this.z; }
  normalize() { const len=Math.sqrt(this.lengthSq())||1;return this.multiplyScalar(1/len); }
  applyAxisAngle() { return this; }
  lerp(v,t) { this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this; }
}
class Obj {
  constructor(...args) {
    this.position=new Vector();this.rotation=new Vector();this.scale=new Vector(1,1,1);
    this.children=[];this.visible=true;this.userData={};this.args=args;
    this.material=args[1]||null;this.geometry=args[0]||null;
    this.isMesh=false;
  }
  add(o) { this.children.push(o);o.parent=this; }
  remove(o) { this.children=this.children.filter(x=>x!==o); }
  traverse(fn) { fn(this); for(const c of this.children) c.traverse(fn); }
  lookAt() {} updateProjectionMatrix() {}
  getWorldDirection(v) { v.set(0,0,-1);return v; }
}
class Mesh extends Obj { constructor(g,m) { super(g,m);this.isMesh=true; } }
class Sprite extends Obj {constructor(material){super(null,material)}}
class Material { constructor(o={}) { Object.assign(this,o);this.color={multiplyScalar(){},setHex(){}};this.emissive={setHex(){}}; } clone(){return new Material(this);} }
class Geo { constructor(){this.type=this.constructor.name;} setFromPoints(){return this;} setAttribute(){} dispose(){} }
class BufferGeo extends Geo {}
class CanvasTexture { constructor(c){this.canvas=c;} }
class Renderer { constructor(){this.shadowMap={};this.info={render:{calls:0,triangles:0}};} setPixelRatio(){}setSize(){}render(){} }
class Light extends Obj {constructor(){super();this.shadow={mapSize:{set(){}},camera:{}};} }
class Raycaster {set(){} intersectObjects(){return [];} }
const THREE = {
  Scene:Obj, Group:Obj, Mesh, Sprite, Points:Mesh, Line:Mesh,
  Color:class{}, FogExp2:class{}, PerspectiveCamera:Obj, WebGLRenderer:Renderer, Clock:class{getDelta(){return .016}}, Raycaster,
  Vector2:Vector, Vector3:Vector, HemisphereLight:Light, DirectionalLight:Light, PointLight:Light,
  MeshStandardMaterial:Material, MeshBasicMaterial:Material, SpriteMaterial:Material, PointsMaterial:Material, LineBasicMaterial:Material,
  CanvasTexture, BufferGeometry:BufferGeo, BufferAttribute:class{},
  SRGBColorSpace:'sRGB',ACESFilmicToneMapping:'aces',PCFSoftShadowMap:'pcf'
};
for(const name of ['BoxGeometry','CylinderGeometry','CircleGeometry','ConeGeometry','DodecahedronGeometry','PlaneGeometry','TorusGeometry','SphereGeometry','CapsuleGeometry']) THREE[name]=Geo;
const elements=new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id,{
    id,style:{},textContent:'',innerHTML:'',disabled:false,visible:true,children:[],
    classList:{add(){},remove(){},toggle(){}},
    addEventListener(){}, querySelector(){return {textContent:''}},
    getContext(){return {createRadialGradient(){return {addColorStop(){}}},fillRect(){},beginPath(){},ellipse(){},fill(){},moveTo(){},lineTo(){},closePath(){},stroke(){}}},
    requestPointerLock(){},
  });
  return elements.get(id);
}
const document={getElementById:element,createElement:()=>element('canvas-dynamic-'+Math.random()),addEventListener(){},pointerLockElement:null};
const localStorage={store:{},getItem(k){return this.store[k]??null},setItem(k,v){this.store[k]=v},removeItem(k){delete this.store[k]}};
const window={innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener(){},confirm:()=>true};
const context=vm.createContext({THREE,document,window,localStorage,console,Math,performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(){},Image:class{}});
const js=source.replace(/^import \* as THREE from 'three';\s*/,'');
vm.runInContext(js,context,{filename:'main.js'});
const evalGame = expression=>vm.runInContext(expression,context);
assert.equal(evalGame('state'),'menu');
assert.equal(evalGame('scene.children.includes(camera)'),true,'arma deve ser filha da câmera presente na cena');
evalGame('newCampaign()');
assert.equal(evalGame('missionPhase'),0);
evalGame('triggerAmbush()');
assert.equal(evalGame('enemies.length'),3);
assert.equal(evalGame('enemies.every(e=>!enemyBlocked(e.group.position.x,e.group.position.z,.45))'),true,'spawn da primeira emboscada fora dos obstáculos');
evalGame('state="playing"; pointerLocked=true; updateGame(.016); shoot()');
assert.equal(evalGame('ammo'),7);
evalGame('enemies.slice().forEach(onEnemyKilled)');
assert.equal(evalGame('missionPhase'),2);
assert.equal(evalGame('checkpoint.phase'),2);
evalGame('state="playing"; player.position.set(4.7,1.7,-43.5); updateInteractPrompt(); interact()');
assert.equal(evalGame('missionPhase'),3);
assert.equal(evalGame('operatorCollider.disabled'),true);
assert.equal(evalGame('escortGroup.visible'),true);
evalGame('player.position.set(-9.3,1.7,-61); updateInteractPrompt(); interact()');
assert.equal(evalGame('intelFound'),true);
evalGame('updateGame(.016)');
evalGame('startFinalDefense(); spawnFinalWave()');
assert.equal(evalGame('missionPhase'),4);
assert.equal(evalGame('enemies.filter(e=>e.alive).length'),3);
assert.equal(evalGame('enemies.filter(e=>e.alive).every(e=>!enemyBlocked(e.group.position.x,e.group.position.z,.45))'),true,'spawn da defesa fora dos obstáculos');
assert.equal(evalGame('canMoveTo(0,-97)'),false,'portão fechado impede atravessar');
evalGame('enemies.filter(e=>e.alive).forEach(onEnemyKilled)');
assert.equal(evalGame('missionPhase'),5);
assert.equal(evalGame('gateOpening'),true);
evalGame('updateGame(.016)');
evalGame('gateOpen=true; player.position.set(0,1.7,-100); finishMission()');
assert.equal(evalGame('state'),'complete');
assert.equal(evalGame('canMoveTo(0,-97)'),true,'portão aberto permite atravessar');
assert.equal(evalGame('completedMission.mission'),'01');
assert.equal(evalGame('savedGame'),null);
assert.equal(evalGame('!!completedMission'),true);
// Voltar ao checkpoint do resgate preserva fase e restaura os objetos.
evalGame('newCampaign(); triggerAmbush(); enemies.slice().forEach(onEnemyKilled); state="playing"; player.position.set(4.7,1.7,-43.5); updateInteractPrompt(); interact(); loadCheckpoint()');
assert.equal(evalGame('missionPhase'),3);
assert.equal(evalGame('operatorRescued'),true);
assert.equal(evalGame('outpostGate.position.y'),1.35);
evalGame('for (let z=-50;z>=-80;z-=5) { player.position.z=z; for (let i=0;i<200;i++) updateEscort(.05); }');
assert.ok(evalGame('escortGroup.position.z') < -72, 'operador deve conseguir chegar à aproximação do posto');
evalGame('continueCampaign(); beginGameplay()');
assert.equal(evalGame('missionPhase'),3,'continuar deve recuperar checkpoint de resgate');
assert.equal(evalGame('operatorRescued'),true);
console.log('OK: menu, 6 inimigos, resgate, defesa, portão, conclusão, save e checkpoint.');
