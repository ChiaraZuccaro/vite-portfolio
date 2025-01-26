import { AmbientLight, AxesHelper, DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
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

camera.position.z = 5
camera.position.x = 5;
camera.position.y = 5;

renderer.setSize(screenSizes.width, screenSizes.height)

const desert = new Desert(camera);
const desertScene = desert.getScene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const axes = new AxesHelper(3);

scene.add(desertScene,aLight, light, axes);


document.body.appendChild(renderer.domElement);
handleResize();

function animate(time: number) {
  // animateCamera(time);
  controls.update();
  // desert.updateScene();
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

function animateCamera(time: number) {
  const ringInnerRadius = 550;
  const ringOuterRadius = 600;
  const ringCenterRadius = (ringInnerRadius + ringOuterRadius) / 2;
  const cameraDistanceFromRing = -20;
  const lookAheadOffset = .5;
  const speed = -0.00005;

  const angle = time * speed;

  const camX = (ringCenterRadius + cameraDistanceFromRing) * Math.cos(angle);
  const camZ = (ringCenterRadius + cameraDistanceFromRing) * Math.sin(angle);
  const camY = 6;

  const lookX = (ringCenterRadius + cameraDistanceFromRing) * Math.cos(angle + lookAheadOffset);
  const lookZ = (ringCenterRadius + cameraDistanceFromRing) * Math.sin(angle + lookAheadOffset);
  const lookY = camY - 5;

  camera.position.set(camX, camY, camZ);
  camera.lookAt(lookX, lookY, lookZ);
}

