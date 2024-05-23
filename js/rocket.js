
import * as THREE from 'three';
import {STLLoader} from 'stlloader';

let euler = [0, 0, -90];
let quaternion = [0, 0, 0, 0];

const canvas = document.querySelector('#canvas');

fitToContainer(canvas);

function fitToContainer(canvas){
  // Make it visually fill the positioned parent
  canvas.style.width ='100%';
  canvas.style.height='100%';
  // ...then set the internal size to match
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (checkWebGL()) {
    webGLnotSupported.classList.add('hidden');
  }
  await finishDrawing();
  await render();
})

function checkWebGL() { 
  try {
   var canvas = document.createElement('canvas'); 
   return !!window.WebGLRenderingContext &&
     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch(e) {
    return false;
  }
};

// THREE utils

async function finishDrawing() {
  return new Promise(requestAnimationFrame);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// THREE

let rocket;

const renderer = new THREE.WebGLRenderer({canvas});

const camera = new THREE.PerspectiveCamera(45, canvas.width/canvas.height, 0.1, 100);
camera.position.set(0, 10, 30);

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');
scene.add(new THREE.AxesHelper(5))
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
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}

{
  const stlLoader = new STLLoader();
  stlLoader.load('assets/rocket.stl', (root) => {
    rocket = new THREE.Mesh(root)
    rocket.scale.set(0.01,0.01,0.01)
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
    if (angleType.value == "euler") {
      let rotationEuler = new THREE.Euler(
        THREE.MathUtils.degToRad(euler[2]),
        THREE.MathUtils.degToRad(euler[0]-180),
        THREE.MathUtils.degToRad(-euler[1]),
        'YZX'
      );
      rocket.setRotationFromEuler(rotationEuler);
    } else {
      let rotationQuaternion = new THREE.Quaternion(quaternion[1], quaternion[3], -quaternion[2], quaternion[0]);
      rocket.setRotationFromQuaternion(rotationQuaternion);
    }
  }

  renderer.render(scene, camera);
  await sleep(10); // Allow 10ms for UI updates
  await finishDrawing();
  await render();
}
