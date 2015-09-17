/*
 * Debug parameters.
 */

// Enable distortion everywhere.
//WEBVR_FORCE_DISTORTION = true;
// Override the distortion background color.
//WEBVR_BACKGROUND_COLOR = new THREE.Vector4(1, 0, 0, 1);
// Change the tracking prediction mode.
//WEBVR_PREDICTION_MODE = 2;
// In prediction mode, change how far into the future to predict.
//WEBVR_PREDICTION_TIME_MS = 100;

//Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.3, 10000);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Create a VR manager helper to enter and exit VR mode.
var manager = new WebVRManager(renderer, effect, {hideButton: false});

// Add a repeating grid as a floor.
var numRepeats = 1000;
var texture = THREE.ImageUtils.loadTexture(
  'img/box.png'
);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(numRepeats, numRepeats);
var geometry = new THREE.BoxGeometry(numRepeats, numRepeats, numRepeats);
var material = new THREE.MeshBasicMaterial({
  map: texture,
  color: 0x333333
});
var floor = new THREE.Mesh(geometry, material);
scene.add(floor);
floor.position.y = -1 - (numRepeats / 2);

// An aiming dot
var geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
var material = new THREE.MeshBasicMaterial({color: 0xFF0000});
var aimer = new THREE.Mesh(geometry, material);
aimer.visible = false;
scene.add(aimer);
aimer.position.set(0, 0, -1.1);

// Request animation frame loop function
function animate(timestamp) {
  camera.position.z += 0.01;

  if (aimer.visible) {
    // Keep the aimer right in front of us
    var vector = new THREE.Vector3(0, 0, -0.9);
    vector.applyQuaternion(camera.quaternion);
    aimer.position.copy(camera.position);
    aimer.position.add(vector);
    aimer.rotation.copy(camera.rotation);
  }

  // Update VR headset position and apply to camera.
  controls.update();

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(animate);
}

// Kick off animation loop
animate();

// Mock editor object til it really exists
var editor = {visible: false};

function onKeyDown(e) {
  if (editor.visible) {

  } else {
    if (e.key == "Shift") {
      aimer.visible = true;
    }
  }
};
window.addEventListener("keydown", onKeyDown, true);
function onKeyUp(e) {
  if (e.key == "Shift") {
    aimer.visible = false;
  }
};
window.addEventListener("keyup", onKeyUp, true);

// Handle window resizes
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  effect.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);
