// Smoke test sem dependências: executa o fluxo de missão com um simulador mínimo de Three.js/DOM.
// Não substitui um teste gráfico em Chromium/WebGL.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const ids = new Set([...html.matchAll(/id="([\w-]+)"/g)].map(m => m[1]));
const generatedIds = new Set(['opt-volume','opt-sensitivity','opt-fov','opt-quality','opt-difficulty','opt-fps','opt-invert','opt-motion','opt-crosshair','replay-chapter']);
for (const [, id] of source.matchAll(/\$\('([\w-]+)'\)/g)) {
  assert.ok(ids.has(id) || generatedIds.has(id), `HTML sem id ${id}`);
}

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
  length(){return Math.sqrt(this.lengthSq());}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
  normalize() { const len=Math.sqrt(this.lengthSq())||1;return this.multiplyScalar(1/len); }
  applyAxisAngle() { return this; }
  distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
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
  updateMatrix() {this.matrix={};} updateMatrixWorld(){} setMatrixAt(){}
  getWorldDirection(v) { v.set(0,0,-1);return v; }
}
class Mesh extends Obj { constructor(g,m) { super(g,m);this.isMesh=true; } }
class Bone extends Obj { constructor(){super();this.isBone=true;this.name='';} }
class Skeleton { constructor(bones=[]){this.bones=bones;this.boneInverses=[];} update(){} }
class Sprite extends Obj {constructor(material){super(null,material)}}
class Material { constructor(o={}) { Object.assign(this,o);this.color={multiplyScalar(){},setHex(){}};this.emissive={setHex(){}}; } clone(){return new Material(this);} dispose(){} }
class Geo { constructor(){this.type=this.constructor.name;} setFromPoints(){return this;} setAttribute(name,value){this.attributes??={};this.attributes[name]=value;} setDrawRange(start,count){this.drawCount=count;} dispose(){} }
class BufferGeo extends Geo {}
class CanvasTexture { constructor(c){this.canvas=c;this.repeat={set(){}};} }
class Renderer { constructor(){this.shadowMap={};this.info={render:{calls:0,triangles:0}};this.capabilities={getMaxAnisotropy:()=>4};} setPixelRatio(){}setSize(){}render(){} }
class Light extends Obj {constructor(){super();this.shadow={mapSize:{set(){}},camera:{}};this.target=new Obj();} }
let mockRayHits=[];
class Raycaster {set(){} intersectObjects(){return mockRayHits;} }
const THREE = {
  Scene:Obj, Group:Obj, Mesh, Sprite, Bone, Skeleton, Points:Mesh, Line:Mesh,
  Color:class{}, FogExp2:class{}, PerspectiveCamera:Obj, WebGLRenderer:Renderer, Clock:class{getDelta(){return .016}}, Raycaster,
  Vector2:Vector, Vector3:Vector, HemisphereLight:Light, DirectionalLight:Light, PointLight:Light, SpotLight:class extends Light{constructor(){super();this.target=new Obj();}},
  MeshStandardMaterial:Material, MeshBasicMaterial:Material, ShaderMaterial:Material, SpriteMaterial:Material, PointsMaterial:Material, LineBasicMaterial:Material,
  CanvasTexture, BufferGeometry:BufferGeo, BufferAttribute:class{constructor(array,size){this.array=array;this.itemSize=size;this.needsUpdate=false;}}, InstancedMesh:class extends Mesh{constructor(g,m,n){super(g,m);this.count=n;this.instanceMatrix={needsUpdate:false};}setMatrixAt(){}}, Object3D:Obj,
  RepeatWrapping:1, BackSide:1, DoubleSide:2, AdditiveBlending:3, NormalBlending:4, NoColorSpace:'none', SRGBColorSpace:'sRGB',ACESFilmicToneMapping:'aces',PCFSoftShadowMap:'pcf'
};
for(const name of ['BoxGeometry','CylinderGeometry','CircleGeometry','ConeGeometry','DodecahedronGeometry','PlaneGeometry','TorusGeometry','SphereGeometry','CapsuleGeometry','OctahedronGeometry','TetrahedronGeometry']) THREE[name]=Geo;
const elements=new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id,{
    id,style:{setProperty(name,value){this[name]=value;}},dataset:{},textContent:'',innerHTML:'',disabled:false,visible:true,children:[],
    classList:{add(){},remove(){},toggle(){}},
    addEventListener(){}, querySelector(){return {textContent:''}},
    getContext(){return {fillText(){},strokeRect(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},putImageData(){},createRadialGradient(){return {addColorStop(){}}},fillRect(){},beginPath(){},ellipse(){},fill(){},moveTo(){},lineTo(){},closePath(){},stroke(){}}},
    requestPointerLock(){},
  });
  return elements.get(id);
}
const document={getElementById:element,createElement:()=>element('canvas-dynamic-'+Math.random()),addEventListener(){},pointerLockElement:null};
const localStorage={store:{},getItem(k){return this.store[k]??null},setItem(k,v){this.store[k]=v},removeItem(k){delete this.store[k]}};

class AudioParamMock { constructor(){this.value=0;} setValueAtTime(v){this.value=v;} exponentialRampToValueAtTime(v){this.value=v;} linearRampToValueAtTime(v){this.value=v;} setTargetAtTime(v){this.value=v;} }
class AudioNodeMock { constructor(){this.gain=new AudioParamMock();this.frequency=new AudioParamMock();this.pan=new AudioParamMock();this.Q=new AudioParamMock();this.connections=[];this.loop=false;} connect(n){this.connections.push(n);return n;} start(){} stop(){} }
class AudioContextMock { constructor(){this.sampleRate=8000;this.currentTime=1;this.state='running';this.destination=new AudioNodeMock();} createBuffer(ch,n){return {getChannelData(){return new Float32Array(n)}};} createGain(){return new AudioNodeMock();} createBufferSource(){return new AudioNodeMock();} createBiquadFilter(){return new AudioNodeMock();} createOscillator(){return new AudioNodeMock();} createStereoPanner(){return new AudioNodeMock();} resume(){this.state='running';} }

const window={innerWidth:1280,innerHeight:720,devicePixelRatio:1,addEventListener(){},confirm:()=>true,AudioContext:AudioContextMock};
const context=vm.createContext({THREE,document,window,localStorage,console,Math,performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(){},Image:class{},setMockRayHits(hits){mockRayHits=hits;}});
const js=source.replace(/^import \* as THREE from 'three';\s*/,'');
vm.runInContext(js,context,{filename:'main.js'});
const evalGame = expression=>vm.runInContext(expression,context);
assert.equal(evalGame('state'),'menu');
assert.ok(evalGame('navigationGrid && navigationGrid.blocked.length > 1000'),'grade de navegação deve ser criada no boot');
assert.ok(evalGame('findNavigationPath(-7,-21, 7,-21, .34).length > 0'),'A* deve encontrar rota ao redor do caminhão');
assert.equal(evalGame('findNavigationPath(-7,-21, 7,-21, .34).every(p=>!navigationGrid.blocked[navigationCell(p.x,p.z)])'),true,'rota A* não deve atravessar células bloqueadas');
assert.equal(evalGame('navigationSegmentBlocked(-7,-21,7,-21,.34)'),true,'linha direta deve reconhecer caminhão como obstáculo');
evalGame("settings.quality='baixo'; applyQuality()");
assert.equal(evalGame('grassField.count'),100,'preset baixo deve reduzir vegetação');
assert.equal(evalGame('rainField.geometry.drawCount'),65,'preset baixo deve reduzir chuva');
evalGame("settings.quality='alto'; applyQuality()");
assert.equal(evalGame('grassField.count'),310,'preset alto deve ampliar vegetação');
assert.equal(evalGame('rainField.geometry.drawCount'),260,'preset alto deve ampliar chuva');
evalGame("settings.quality='equilibrado'; applyQuality()");
assert.equal(evalGame('scene.children.includes(camera)'),true,'arma deve ser filha da câmera presente na cena');
evalGame('newCampaign()');
assert.equal(Object.prototype.hasOwnProperty.call(context, 'reloadProgress'), false, 'nova campanha não deve criar variável global de recarga indefinida');
assert.equal(evalGame('missionPhase'),0);
evalGame('triggerAmbush()');
assert.equal(evalGame('enemies.length'),3);
assert.equal(evalGame('enemies.filter(e=>e.type==="soldado_corrompido").length'),1,'primeira emboscada deve incluir um inimigo armado');
assert.ok(evalGame('enemies.find(e=>e.type==="soldado_corrompido").weaponGroup'),'soldado corrompido deve carregar um fuzil 3D');
assert.equal(evalGame('enemies.every(e=>!enemyBlocked(e.group.position.x,e.group.position.z,.45))'),true,'spawn da primeira emboscada fora dos obstáculos');
evalGame('state="playing"; pointerLocked=true; updateGame(.016); shoot()');
assert.equal(evalGame('noiseEvent.type'),'gunshot','disparo deve gerar evento sonoro');
assert.ok(evalGame('crosshairSpread') > 5,'disparo deve abrir a mira dinâmica');
// O soldado corrompido deve mirar, disparar, criar um traçante e causar dano ao jogador.
evalGame("var armedEnemy=enemies.find(e=>e.type==='soldado_corrompido'); armedEnemy.group.position.set(0,0,10); armedEnemy.group.rotation.y=0; armedEnemy.fireCooldown=0; armedEnemy.rangedAccuracy=1; player.position.set(0,1.7,0); updateEnemies(.016)");
assert.equal(evalGame('armedEnemy.state'),'aiming','soldado deve preparar a mira antes do disparo');
evalGame('armedEnemy.aimTime=.01; health=100; updateEnemies(.016)');
assert.equal(evalGame('armedEnemy.state'),'recover','soldado deve entrar em recuperação depois de atirar');
assert.equal(evalGame('health'),92,'tiro do soldado deve causar dano quando o jogador não se esquiva');
assert.ok(evalGame('effects.some(effect=>effect.type==="enemyTracer")'),'tiro inimigo deve produzir traçante visível');
assert.ok(evalGame('armedEnemy.weaponFlash.visible'),'fuzil inimigo deve produzir clarão de disparo');
// Esquiva: sair da linha de tiro durante a preparação deve evitar o dano.
evalGame('player.position.set(5,1.7,0); health=100; armedEnemy.aimTargetX=0; armedEnemy.aimTargetY=1.15; armedEnemy.aimTargetZ=0; armedEnemy.weaponAmmo=5; fireEnemyWeapon(armedEnemy)');
assert.equal(evalGame('health'),100,'jogador que sai da linha de tiro deve evitar o disparo');
// O soldado usa carregador finito e precisa recarregar antes de voltar a atirar.
evalGame('armedEnemy.weaponAmmo=1; armedEnemy.weaponReserve=5; fireEnemyWeapon(armedEnemy); fireEnemyWeapon(armedEnemy)');
assert.equal(evalGame('armedEnemy.state'),'reloading','soldado sem munição deve iniciar recarga');
evalGame('updateEnemies(1.6)');
assert.equal(evalGame('armedEnemy.weaponAmmo'),5,'recarga inimiga deve repor o carregador');
assert.equal(evalGame('armedEnemy.weaponReserve'),0,'recarga inimiga deve consumir a reserva');
// Um obstáculo entre o fuzil e Raul bloqueia o disparo.
evalGame("player.position.set(0,1.7,0); armedEnemy.group.position.set(0,0,10); armedEnemy.group.rotation.y=0; armedEnemy.aimTargetX=0; armedEnemy.aimTargetY=1.15; armedEnemy.aimTargetZ=0; armedEnemy.weaponAmmo=5; health=100; setMockRayHits([{distance:1}]); fireEnemyWeapon(armedEnemy)");
assert.equal(evalGame('health'),100,'cobertura deve bloquear o tiro inimigo');
evalGame('setMockRayHits([])');
// A seleção de cobertura deve encontrar o lado oposto de um obstáculo em relação ao jogador.
evalGame("var savedColliders=colliders; colliders=[{x:0,z:3,r:1,disabled:false}]; setMockRayHits([{distance:1}])");
assert.ok(evalGame('findEnemyCoverPosition(armedEnemy)'),'soldado ferido deve conseguir selecionar uma posição de cobertura');
evalGame('setMockRayHits([]); colliders=savedColliders; player.position.set(0,1.7,28)');
evalGame("emitNoise(100,'gunshot'); emitNoise(2.8,'crouch'); updateEnemies(.016)");
assert.ok(evalGame('enemies.every(e=>e.lastHeardAt >= 0)'),'inimigos devem investigar ruído mesmo sem linha de visão');
assert.equal(evalGame('ammo'),7);
// Troca de arma, cadência, munição independente e recarga sem duplicação.
evalGame("switchWeapon('pistol'); fireCooldown=0; shoot()");
assert.equal(evalGame('currentWeapon'),'pistol');
assert.equal(evalGame('pistolAmmo'),11);
assert.equal(evalGame('ammo'),7,'pistola não deve consumir munição do fuzil');
evalGame('fireCooldown=0; startReload()');
assert.equal(evalGame('isReloading'),true);
evalGame('finishReload()');
assert.equal(evalGame('pistolAmmo'),12);
assert.equal(evalGame('pistolReserve'),35);
evalGame("switchWeapon('rifle')");
assert.equal(evalGame('currentWeapon'),'rifle');
assert.equal(evalGame('weaponGroup.visible'),true);
assert.equal(evalGame('pistolGroup.visible'),false);
evalGame('fireCooldown=0; captureCheckpoint(1)');
assert.equal(evalGame('savedGame.version'),3);
assert.equal(evalGame('savedGame.checkpoint.pistolReserve'),35);
assert.equal(evalGame('savedGame.checkpoint.currentWeapon'),'rifle');
// Dano sinalizado por direção, sem tornar o efeito permanente.
evalGame('damagePlayer(3, new THREE.Vector3(1,0,0))');
assert.ok(evalGame('damageDirectionTime') > 0);
evalGame('updateEffects(1)');
assert.ok(evalGame('damageDirectionTime') <= 0);

assert.equal(evalGame('grenades'),2);
evalGame('throwGrenade()');
assert.equal(evalGame('grenades'),1);
assert.equal(evalGame('grenadeProjectiles.length'),1);
evalGame('updateGrenades(2.2)');
assert.equal(evalGame('grenadeProjectiles.length'),0);
evalGame('meleeAttack()');
assert.ok(evalGame('meleeCooldown') > 0);
evalGame('enemies[0].group.position.set(0,0,26.5); meleeCooldown=0; meleeAttack()');
assert.ok(evalGame('enemies[0].health') < 58,'golpe deve causar dano ao alvo próximo');
evalGame("handleKeyDown({code:'KeyQ',repeat:false,preventDefault(){}})");
assert.equal(evalGame('flashlight.userData.enabled'),true,'lanterna deve ligar');
evalGame("handleKeyDown({code:'KeyQ',repeat:false,preventDefault(){}})");
assert.equal(evalGame('flashlight.userData.enabled'),false,'lanterna deve desligar');
evalGame('enemies.slice().forEach(onEnemyKilled)');
assert.equal(evalGame('enemies.every(e=>e.deadTime===0)'),true,'inimigos mortos iniciam animação de queda');
evalGame('updateEnemies(.24)');
assert.ok(evalGame('enemies.every(e=>e.deadTime > 0)'),'animação de queda deve avançar com o tempo');
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
assert.equal(evalGame('enemies.filter(e=>e.alive && e.type==="soldado_corrompido").length'),1,'defesa final também deve incluir inimigo armado');
assert.equal(evalGame('enemies.filter(e=>e.alive).every(e=>!enemyBlocked(e.group.position.x,e.group.position.z,.45))'),true,'spawn da defesa fora dos obstáculos');
assert.equal(evalGame('canMoveTo(0,-97)'),false,'portão fechado impede atravessar');
evalGame('var crawler=enemies.find(e=>e.type==="rastejador"); crawler.group.position.set(player.position.x,0,player.position.z+1.8); crawler.state="chase"; crawler.path=null; updateEnemies(.016)');
assert.equal(evalGame('enemies.find(e=>e.type==="rastejador").state'),'windup','Rastejador deve telegrafar investida');
evalGame('var crawler=enemies.find(e=>e.type==="rastejador"); crawler.windup=0; updateEnemies(.016)');
assert.equal(evalGame('enemies.find(e=>e.type==="rastejador").state'),'lunge','Rastejador deve executar investida após aviso');
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
evalGame('delete checkpoint.grenades; delete checkpoint.pistolAmmo; delete checkpoint.pistolReserve; delete checkpoint.currentWeapon; loadCheckpoint()');
assert.equal(evalGame('grenades'),2,'old saves sem granadas recuperam fallback');
assert.equal(evalGame('pistolAmmo'),12,'save antigo recupera munição da pistola');
assert.equal(evalGame('pistolReserve'),36,'save antigo recupera reserva da pistola');
assert.equal(evalGame('currentWeapon'),'rifle','save antigo seleciona o fuzil');
// Checkpoints da emboscada e da defesa devem restaurar o soldado armado.
evalGame("checkpoint={x:0,z:-20,phase:1,health:100,ammo:8,reserve:40}; loadCheckpoint()");
assert.equal(evalGame('enemies.filter(e=>e.type==="soldado_corrompido").length'),1,'checkpoint da emboscada deve restaurar o inimigo armado');
evalGame("checkpoint={x:0,z:-80,phase:4,health:100,ammo:8,reserve:40,operatorRescued:true}; loadCheckpoint()");
assert.equal(evalGame('enemies.filter(e=>e.alive && e.type==="soldado_corrompido").length'),1,'checkpoint da defesa deve restaurar o inimigo armado');
// Salvos das versões 0.2 e 0.3 continuam disponíveis.
evalGame('savedGame.version=2; updateContinueButton()');
assert.equal(element('continue-btn').disabled,false);


// v0.7 — rig esquelético, mãos do viewmodel, materiais procedurais e explosões em camadas.
assert.ok(evalGame('enemies[0].skeleton && enemies[0].skeleton.bones.length >= 14'), 'inimigos devem possuir rig com ossos nomeados');
assert.ok(evalGame('enemies[0].rig.spine && enemies[0].rig.headBone && enemies[0].rig.knees.length===2'), 'rig deve conter coluna, cabeça e joelhos');
assert.ok(evalGame('weaponGroup.userData.viewRig.arms.length===2 && pistolGroup.userData.viewRig.arms.length===2'), 'armas do jogador devem incluir braços e mãos articulados');
assert.ok(evalGame('weaponGroup.children.some(o=>o.isBone) && weaponGroup.userData.skeleton.bones.length===4'), 'mãos do fuzil devem usar esqueleto de braços e punhos');
evalGame('var rigEnemy=enemies[0]; rigEnemy.group.position.set(0,0,8); rigEnemy.lastSeenAt=elapsedMission; rigEnemy.lastKnownX=player.position.x; rigEnemy.lastKnownZ=player.position.z; updateEnemies(.08)');
assert.ok(evalGame('enemies[0].skeleton.bones.some(b=>b.name.startsWith("hip_"))'), 'animação deve manter ossos de quadril');
assert.ok(evalGame('enemies[0].animationMode === \"run\" || enemies[0].animationMode === \"walk\"'), 'inimigos devem selecionar uma marcha animada');
assert.ok(evalGame('surfaceMat("test-painted",0x445544,"painted").map && surfaceMat("test-painted",0x445544,"painted").roughnessMap && surfaceMat("test-painted",0x445544,"painted").bumpMap'), 'materiais devem ter mapas de cor, rugosidade e relevo');
evalGame("var mockGrenade={mesh:{position:new THREE.Vector3(1,.2,2)}}; spawnVolumetricExplosion(mockGrenade.mesh.position,1)");
assert.ok(evalGame('effects.some(e=>e.type==="volumetricExplosion" && e.sprites.length>=4 && e.light)'), 'explosão deve ter sprites volumétricos e luz dinâmica');
evalGame('updateEffects(.25)');
assert.ok(evalGame('effects.some(e=>e.type==="volumetricExplosion" && e.life<.95)'), 'explosão deve evoluir com o tempo');


// WebAudio ambiental: inicia somente após o gesto de jogo e reduz o ambiente fora da missão.
evalGame('initAudio()');
assert.ok(evalGame('ambientNodes && ambientNodes.wind.loop && ambientNodes.rumble && ambientNoiseBuffer'), 'áudio deve iniciar camadas contínuas de vento e rumble');
evalGame('state="playing"; updateAmbientAudio(.016); playDistantArtillery(); playRadioStatic(); playShotSound(new THREE.Vector3(4,0,-8))');
assert.ok(evalGame('ambientNodes.master.gain.value > 0'), 'volume ambiente deve acompanhar a configuração');
evalGame('state="paused"; updateAmbientAudio(.016)');
assert.ok(evalGame('ambientNodes.windGain.gain.value < .08'), 'ambiente deve baixar quando o jogo está pausado');

console.log('OK v0.7: rig esquelético, mãos articuladas, materiais procedurais, explosões em camadas e regressão da campanha.');
