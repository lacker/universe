var CONTROLS;
var HAVE_POINTER_LOCK = checkForPointerLock();

function checkForPointerLock() {
  return "pointerLockElement" in document || 
         "mozPointerLockElement" in document || 
         "webkitPointerLockElement" in document;
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
      element.innerHTML = "PointerLock Error";
    };

    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

    document.addEventListener("pointerlockerror", pointerlockerror, false);
    document.addEventListener("mozpointerlockerror", pointerlockerror, false);
    document.addEventListener("webkitpointerlockerror", pointerlockerror, false);

    var requestPointerLock = function(event) {
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    };
    element.addEventListener("click", requestPointerLock, false);
  } else {
    element.innerHTML = "Bad browser; No pointer lock";
  }
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function main() {
  initPointerLock();

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

  // Make a canvas that could have text
  var FONT_SIZE_PX = 40;
  var NUM_LINES = 20;
  var CANVAS_SIZE_PX = NUM_LINES * FONT_SIZE_PX + FONT_SIZE_PX * 0.2;
  var canvas = document.createElement("canvas");
  canvas.width = canvas.height = CANVAS_SIZE_PX;
  var context = canvas.getContext("2d");
  context.font = FONT_SIZE_PX + "px Inconsolata,monospace";
  context.globalCompositeOperation = "darker";
  var textMetrics = context.measureText("0");
  var charWidth = textMetrics.width;
  var numCols = Math.floor(CANVAS_SIZE_PX / charWidth);

  // Float it in the air
  var textTexture = new THREE.Texture(canvas);
  textTexture.minFilter = THREE.NearestFilter;
  var textAreaMat = new THREE.MeshBasicMaterial(
    {map: textTexture, side: THREE.DoubleSide});
  textAreaMat.transparent = true;
  var editor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial(textAreaMat));
  editor.position.set(0, 10, -stuffDistance);
  editor.rotation.y = 0.1;
  editor.visible = false;
  editor.value = "hello world\nmultiline works\ngo bengals";
  editor.cursor = 0;
  editor.lastValue = "";
  editor.lastCursor = 0;
  scene.add(editor);

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

  // Gets its text from the text area
  editor.update = function() {
    if (editor.value == editor.lastValue &&
        editor.cursor == editor.lastCursor) {
      return;
    }

    // Display text
    context.clearRect(0, 0, CANVAS_SIZE_PX, CANVAS_SIZE_PX);
    context.fillStyle = "hsla(0, 0%, 100%, 0.8)";
    context.fillRect(0, 0, CANVAS_SIZE_PX, CANVAS_SIZE_PX);
    editor.lastValue = editor.value;
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
  
  CONTROLS = new THREE.PointerLockControls(camera);
  scene.add(CONTROLS.getObject());

  // An aiming dot
  var geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  var material = new THREE.MeshBasicMaterial({color: 0xFF0000});
  var aimer = new THREE.Mesh(geometry, material);
  aimer.visible = false;
  camera.add(aimer);
  aimer.position.set(0, 0, -1.1);
  
  // Find the object the aimer is aiming at
  function aimee() {
    var vector = new THREE.Vector3(0, 0, -1);
    vector = camera.localToWorld(vector);
    vector.sub(camera.position);
    // Now vector is a unit vector with the same direction as the camera
    var raycaster = new THREE.Raycaster( camera.position, vector);

    var objects = raycaster.intersectObjects(scene.children);
    if (objects.length == 0) {
      return null;
    }
    return objects[0];
  }
  
  Mousetrap.bind("shift", function() {
    if (!editor.visible) {
      aimer.visible = true;
    }
  }, "keydown");

  Mousetrap.bind("shift", function() {
    aimer.visible = false;
  }, "keyup");

  Mousetrap.bind("shift+z", function() {
    if (!editor.visible) {
      console.log(aimee());
    }
  });
  
  // Keys that go into the editor
  Mousetrap.bind([
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "space",
    "enter",
  ], function(e) {
    if (editor.visible) {
      var display = e.key;
      if (display == "Enter") {
        display = "\n";
      }
      editor.insert(display);
    }
  });

  Mousetrap.bind("shift+t", function() {
    if (!editor.visible) {
      // Displays the text editor for testing
      editor.visible = true;
    }
  });

  Mousetrap.bind("~", function() {
    // Close the text editor
    editor.visible = false;
  });

  // Start rendering
  function render() {
    requestAnimationFrame(render);

    editor.update();

    lightAngle += 0.01;
    spotLight.position.x = Math.cos(lightAngle) * lightWidth;
    spotLight.position.z = Math.sin(lightAngle) * lightWidth;

    renderer.render(scene, camera);
  }
  render();
}

