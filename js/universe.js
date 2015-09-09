
function main() {
  console.log("innerWidth: " + window.innerWidth);
  console.log("innerHeight: " + window.innerHeight);

  // Set up rendering
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Make a green cube
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({color: 0x66cc33});
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Make a yellow cube for the sun
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({color: 0xcccc33});
  var sun = new THREE.Mesh(geometry, material);
  sun.position.set(0, 0, 5);
  scene.add(sun);

  // Light source
  var lightAngle = 0;
  var lightHeight = 300;
  var lightWidth = 400;
  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, 0, lightHeight); // does this do anything?
  spotLight.castShadow = true;
  scene.add(spotLight);

  // Position camera
  // TODO: keeping up up would be nice but seems not-default. am I
  // thinking of axes wrongly?
  camera.position.x = 0;
  camera.position.y = -10;
  camera.position.z = 5;
  camera.lookAt(cube.position);

  // Start rendering
  function render() {
    requestAnimationFrame(render);
    
    lightAngle += 0.01;
    spotLight.position.x = Math.cos(lightAngle) * lightWidth;
    spotLight.position.y = Math.sin(lightAngle) * lightWidth;

    renderer.render(scene, camera);
  }
  render();
}

