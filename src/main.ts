import { AmbientLight, AxesHelper, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Desert } from './scenes/desert/Desert.class';

import './style.css';

const screenSizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

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

camera.position.z = 70
camera.position.y = 60

const desert = new Desert().getScene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const axes = new AxesHelper(3);

scene.add(desert,aLight, light, axes);


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