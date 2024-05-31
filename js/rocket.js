
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const canvas = document.querySelector('#canvas');

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

// THREE utils

async function finishDrawing() {
  return new Promise(requestAnimationFrame);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// THREE (dimension en x10-2)

let rocket;

const renderer = new THREE.WebGLRenderer({canvas});

const camera = new THREE.PerspectiveCamera(50, canvas.width/canvas.height, 0.1, 100);
camera.position.set(20, 30, 20);

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
scene.add(new THREE.AxesHelper())

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

{
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0x666666;  // black
  const intensity = 0.5;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}

{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light2 = new THREE.DirectionalLight(color, intensity);
  light2.position.set(0, 10, 0);
  light2.target.position.set(-5, 0, 0);
  scene.add(light2);
  scene.add(light2.target);
}

{
  const stlLoader = new STLLoader();
  stlLoader.load('assets/rocket.stl', (geometry) => {
    const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x111111, shininess: 200 })
    rocket = new THREE.Mesh(geometry, material)
    rocket.scale.set(0.01,0.01,0.01) // de m a cm
    scene.add(rocket);
  });
}


function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

async function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (rocket != undefined) {
    if (angleType.value == 'euler') {
      let rotationEuler = new THREE.Euler(
        THREE.MathUtils.degToRad(euler[0]+eulerOffset[0]),
        THREE.MathUtils.degToRad(euler[1]+eulerOffset[1]),
        THREE.MathUtils.degToRad(euler[2]+eulerOffset[2]),
        'XYZ'
      );
      // console.log(rotationEuler)
      rocket.setRotationFromEuler(rotationEuler);
    } else {
      let rotationQuaternion = new THREE.Quaternion(quaternion[1], quaternion[3], -quaternion[2], quaternion[0]);
      rocket.setRotationFromQuaternion(rotationQuaternion);
    }
  }

  controls.update();

  renderer.render(scene, camera);
  await sleep(10); // Allow 10ms for UI updates
  await finishDrawing();
  await render();
}

// CODE

fitToContainer(canvas);
if ( WebGL.isWebGLAvailable() ) {
  webGLnotSupported.classList.add('hidden');
  await finishDrawing();
  await render();
}
