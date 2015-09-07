
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

  // Make a single green cube
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({color: 0x66cc33});
  var cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;
  
  // Start rendering
  function render() {
    requestAnimationFrame(render);
    cube.rotation.x += 0.01 * Math.random();
    cube.rotation.y += 0.01 * Math.random();
    renderer.render(scene, camera);
  }
  render();
}

