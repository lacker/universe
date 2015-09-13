// palette:
// 990033 - red
// 669900 - green
// 0099FF - light blue 
// 0033CC - dark blue

var CONTROLS;
var HAVE_POINTER_LOCK = checkForPointerLock();

function checkForPointerLock() {
  return 'pointerLockElement' in document || 
         'mozPointerLockElement' in document || 
         'webkitPointerLockElement' in document;
}

function initPointerLock() {
  var element = document.body;

  if (HAVE_POINTER_LOCK) {
    var pointerlockchange = function(event) {
      if (document.pointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element) {
        controlsEnabled = true;
        CONTROLS.enabled = true;
      } else {
        controlsEnabled = false;
        CONTROLS.enabled = false;
      }
    };

    var pointerlockerror = function(event) {
      element.innerHTML = 'PointerLock Error';
    };

    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    var requestPointerLock = function(event) {
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    };
    element.addEventListener('click', requestPointerLock, false);
  } else {
    element.innerHTML = 'Bad browser; No pointer lock';
  }
}

function main() {
  initPointerLock();

  var k = new Kibo();

  // Set up rendering
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 1, 10000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var stuffDistance = 20;

  // Make a green grass
  var geometry = new THREE.BoxGeometry(10, 1, 10);
  var material = new THREE.MeshLambertMaterial({color: 0x669900});
  var grass = new THREE.Mesh(geometry, material);
  grass.position.set(0, 0, -stuffDistance);
  scene.add(grass);

  // Make a blue ocean
  var geometry = new THREE.BoxGeometry(1000, 1, 1000);
  var material = new THREE.MeshLambertMaterial({color: 0x0033CC});
  var ocean = new THREE.Mesh(geometry, material);
  ocean.position.set(0, -1, -stuffDistance);
  scene.add(ocean);

  // A random brick floating in the air
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({color: 0x990033});
  var brick = new THREE.Mesh(geometry, material);
  brick.position.set(0, 1, -stuffDistance);
  scene.add(brick);
  
  // Just a bit of ambient light for convenience
  var ambient = new THREE.AmbientLight(0x333333);
  scene.add(ambient);

  // The main light source is like an arctic sun
  var lightAngle = 0;
  var lightHeight = 300;
  var lightWidth = 400;
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, lightHeight, 0);
  scene.add(spotLight);

  // Position camera
  camera.position.x = 0;
  camera.position.y = 3;
  camera.position.z = 0;
  camera.lookAt(grass.position);
  
  CONTROLS = new THREE.PointerLockControls(camera);
  scene.add(CONTROLS.getObject());

  // Start rendering
  function render() {
    requestAnimationFrame(render);

    // Experiment here to see things move
    // camera.position.y -= 0.01;
    
    lightAngle += 0.01;
    spotLight.position.x = Math.cos(lightAngle) * lightWidth;
    spotLight.position.z = Math.sin(lightAngle) * lightWidth;

    renderer.render(scene, camera);
  }
  render();
}

