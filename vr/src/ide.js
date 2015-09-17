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

// The canvas for the editor
var FONT_SIZE_PX = 40;
var NUM_LINES = 40;
var CANVAS_SIZE_PX = NUM_LINES * FONT_SIZE_PX + FONT_SIZE_PX * 0.2;
var canvas = document.createElement("canvas");
canvas.width = canvas.height = CANVAS_SIZE_PX;
var context = canvas.getContext("2d");
context.font = FONT_SIZE_PX + "px Inconsolata,monospace";
context.globalCompositeOperation = "darker";
var textMetrics = context.measureText("0");
var charWidth = textMetrics.width;
var numCols = Math.floor(CANVAS_SIZE_PX / charWidth);

// The display pane for the editor
var textTexture = new THREE.Texture(canvas);
textTexture.minFilter = THREE.NearestFilter;
textTexture.wrapS = THREE.ClampToEdgeWrapping;
textTexture.wrapT = THREE.ClampToEdgeWrapping;
textTexture.repeat.set(1, 1);
var geometry = new THREE.PlaneGeometry(2, 2);
var material = new THREE.MeshBasicMaterial({
  map: textTexture,
  color: 0xFFFFFF,
  side: THREE.DoubleSide
});
var editor = new THREE.Mesh(geometry, material);
scene.add(editor);
editor.visible = false;
editor.value = "hello world\nmultiline works";
editor.cursor = 0;
editor.lastValue = "";
editor.lastCursor = 0;

// Functionality for the editor
// Returns x and y
editor.cursorPosition = function() {
  var x = 0;
  var y = 0;
  var remaining = editor.cursor;
  var lines = editor.value.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (remaining <= line.length) {
      x = remaining;
      break;
    }
    y++;
    remaining -= (line.length + 1);
  }
  return { x: x,
           y: y }
}

editor.setCursorPosition = function(x, y) {
  var acc = 0;
  var lines = editor.value.split("\n");
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    if (i > y) {
      break;
    }
    if (i == y) {
      acc += Math.min(x, line.length);
      break;
    }
    acc += line.length + 1;
  }
  
  editor.cursor = acc;
}

editor.cursorLeft = function() {
  if (editor.cursor > 0) {
    editor.cursor--;
  }
}

editor.cursorRight = function() {
  if (editor.cursor < editor.value.length) {
    editor.cursor++;
  }
}

editor.del = function() {
  if (editor.cursor == 0) {
    return;
  }
  editor.value = (editor.value.slice(0, editor.cursor - 1) +
                  editor.value.slice(editor.cursor));
  editor.cursor--;
}

editor.cursorUp = function() {
  var pos = editor.cursorPosition();
  editor.setCursorPosition(pos.x, pos.y - 1);
}

editor.cursorDown = function() {
  var pos = editor.cursorPosition();
  editor.setCursorPosition(pos.x, pos.y + 1);
}

// Gets its text from the text area
editor.update = function() {
  if (editor.value == editor.lastValue &&
      editor.cursor == editor.lastCursor) {
    return;
  }
  editor.lastValue = editor.value;
  editor.lastCursor = editor.cursor;

  // Display text
  context.clearRect(0, 0, CANVAS_SIZE_PX, CANVAS_SIZE_PX);
  context.fillStyle = "hsla(0, 0%, 100%, 0.6)";
  context.fillRect(0, 0, CANVAS_SIZE_PX, CANVAS_SIZE_PX);
  var lines = editor.value.split("\n")
  for (var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    context.fillStyle = "hsl(0, 0%, 25%)";
    context.fillText(line, 0, FONT_SIZE_PX + FONT_SIZE_PX * i);
  }

  // Display the cursor
  var pos = editor.cursorPosition();
  context.fillRect(
    pos.x * charWidth,
    (pos.y + 0.2) * FONT_SIZE_PX,
    5, // cursor width
    FONT_SIZE_PX);

  textTexture.needsUpdate = true;
}

editor.insert = function(text) {
  editor.value = (editor.value.slice(0, editor.cursor) + text +
                  editor.value.slice(editor.cursor));
  editor.cursor++;
}


// Player's velocity in camera-space with y projected out
var velocity = {x: 0, z: 0};

// Request animation frame loop function
function animate(timestamp) {
  if (velocity.x != 0 || velocity.z != 0) {
    // Turn our velocity vector in the camera direction
    var vector = new THREE.Vector3(velocity.x, 0, velocity.z);
    vector.applyQuaternion(camera.quaternion);

    // Project and rescale to keep motion in the y=0 plane
    var len = vector.length();
    vector.y = 0;
    vector.setLength(len);

    // Move the camera
    camera.position.add(vector);
  }

  if (aimer.visible) {
    // Keep the aimer right in front of us
    var vector = new THREE.Vector3(0, 0, -0.9);
    vector.applyQuaternion(camera.quaternion);
    aimer.position.copy(camera.position);
    aimer.position.add(vector);
    aimer.rotation.copy(camera.rotation);
  }

  if (editor.visible) {
    // Keep the editor in front of us
    var vector = new THREE.Vector3(1.4, 0.3, -2);
    vector.applyQuaternion(camera.quaternion);
    editor.position.copy(camera.position);
    editor.position.add(vector);
    editor.rotation.copy(camera.rotation);
    editor.rotation.y -= 0.1;
  }

  editor.update();

  // Update VR headset position and apply to camera.
  controls.update();

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

  requestAnimationFrame(animate);
}

// Kick off animation loop
animate();

// Handle keypresses
function onKeyDown(e) {
  if (editor.visible) {
    switch(e.key) {
    case "`":
      editor.visible = false;
      break;

    case "a":
    case "b":
    case "c":
    case "d":
    case "e":
    case "f":
    case "g":
    case "h":
    case "i":
    case "j":
    case "k":
    case "l":
    case "m":
    case "n":
    case "o":
    case "p":
    case "q":
    case "r":
    case "s":
    case "t":
    case "u":
    case "v":
    case "w":
    case "x":
    case "y":
    case "z":
    case "A":
    case "B":
    case "C":
    case "D":
    case "E":
    case "F":
    case "G":
    case "H":
    case "I":
    case "J":
    case "K":
    case "L":
    case "M":
    case "N":
    case "O":
    case "P":
    case "Q":
    case "R":
    case "S":
    case "T":
    case "U":
    case "V":
    case "W":
    case "X":
    case "Y":
    case "Z":
    case "'":
    case '"':
    case "{":
    case "}":
    case "[":
    case "]":
    case "(":
    case ")":
    case ";":
    case ":":
    case "<":
    case ">":
    case "/":
    case ".":
    case ",":
    case "-":
    case "_":
    case "=":
    case "+":
    case "!":
    case "$":
    case "&":
    case "|":
    case "*":
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
    case "\\":
    case " ":
    case "Enter":

      var key = e.key;
      if (key == "Enter") {
        key = "\n";
      }

      console.log("inserting: " + key);
      editor.insert(key);

      e.preventDefault();
      break;

    case "ArrowUp":
      editor.cursorUp();
      e.preventDefault();
      break;

    case "ArrowDown":
      editor.cursorDown();
      e.preventDefault();
      break;

    case "ArrowLeft":
      editor.cursorLeft();
      e.preventDefault();
      break;

    case "ArrowRight":
      editor.cursorRight();
      e.preventDefault();
      break;

    case "Backspace":
      editor.del();
      e.preventDefault();
      break;
    }

  } else {
    switch(e.key) {
    case "e":
    case "E":
      if (aimer.visible) {
        editor.visible = true;
        aimer.visible = false;
      }
      break;
    case "Shift":
      aimer.visible = true;
      break;
    case "w":
    case "W":
      velocity.z = -0.1;
      break;
    case "s":
    case "S":
      velocity.z = 0.1;
      break;
    case "a":
    case "A":
      velocity.x = -0.1;
      break;
    case "d":
    case "D":
      velocity.x = 0.1;
      break;
    }
  }
};
window.addEventListener("keydown", onKeyDown, true);
function onKeyUp(e) {
  if (editor.visible) {

  } else {
    switch(e.key) {
    case "Shift":
      aimer.visible = false;
      break;
    case "w":
    case "s":
      velocity.z = 0;
      break;
    case "a":
    case "d":
      velocity.x = 0;
      break;
    }
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
