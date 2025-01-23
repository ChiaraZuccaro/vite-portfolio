import { AmbientLight, DirectionalLight, LoadingManager, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Desert } from './scenes/desert/Desert.class';

import './style.css';

// import mapColor from './textures/desert/road/asphalt_DIFF.jpg';
// import disp from './textures/desert/road/asphalt_DISP.png';
// import normal from './textures/desert/road/asphalt_NOR.exr';
// import map from './textures/desert/road/asphalt_DIFF.jpg';

const screenSizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const loadingManager = new LoadingManager();
const texturesLoad = new TextureLoader(loadingManager);

const light = new DirectionalLight(0xffffff, 1.5);
light.position.set(5,5,10)

const aLight = new AmbientLight(0xffffff, 0.5);

const scene = new Scene();
const camera = new PerspectiveCamera(75, screenSizes.width / screenSizes.height, 0.1, 6000);
const renderer = new WebGLRenderer({
  antialias: window.devicePixelRatio < 2,
  logarithmicDepthBuffer: true
});

renderer.setSize(screenSizes.width, screenSizes.height)

camera.position.z = 7
camera.position.x = -2

const desert = new Desert().getScene();

// start road mesh
// const dispPath = import.meta.env.BASE_URL + "textures/desert/mountains/cliff_disp.png";
// const displacementMap = texturesLoad.load(dispPath);

// const normalPath = import.meta.env.BASE_URL + "textures/desert/mountains/cliff_nor.png";
// const normalMap = texturesLoad.load(normalPath);

// const mapPath = import.meta.env.BASE_URL + "textures/desert/mountains/cliff_color.jpg";
// const map = texturesLoad.load(mapPath);

// const mapAOPath = import.meta.env.BASE_URL + "textures/desert/mountains/cliff_occ.jpg";
// const aoMap = texturesLoad.load(mapAOPath);


// const sphereGeometry = new SphereGeometry(1, 100, 100);
// const sphereMaterial = new MeshStandardMaterial({
//   color: 0xf9a23b,
//   map,
//   displacementMap,
//   displacementScale: .3,
//   normalMap,
//   normalScale: new Vector2(1, -1),
//   aoMap,
//   aoMapIntensity: 1
// });
// const road = new Mesh(sphereGeometry, sphereMaterial);
// end road mesh

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(desert,aLight, light);


document.body.appendChild(renderer.domElement);
handleResize();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

window.addEventListener('resize', handleResize);

function handleResize() {
  screenSizes.width = window.innerWidth;
  screenSizes.height = window.innerHeight;

  camera.aspect = screenSizes.width / screenSizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(screenSizes.width, screenSizes.height);

  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
}