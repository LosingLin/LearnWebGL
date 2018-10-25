
// let scene = new THREE.Scene();
// let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// let renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);

// document.body.appendChild(renderer.domElement);

// let geometry = new THREE.CubeGeometry(1, 1, 1);
// let material = new THREE.MeshBasicMaterial({color:0xffff00});
// let cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;

// function render() {
//     requestAnimationFrame(render);

//     cube.rotation.x += 0.02;
//     cube.rotation.y += 0.02;

//     renderer.render(scene, camera);
// }

// render();

let canvasFrame = document.getElementById('canvas-frame');
let width = canvasFrame.clientWidth;
let height = canvasFrame.clientHeight;

let renderer;
function initThree() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    canvasFrame.appendChild(renderer.domElement);
    // renderer.setClearColor(0xFFFFFF, 1.0);
}

let camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;

    camera.up.x = 0;
    camera.up.y = 0;
    camera.up.z = 1;

    camera.lookAt(0, 0, 0);
}

let scene;
function initScene() {
    scene = new THREE.Scene();
}

let light;
function initLight() {
    light = new THREE.DirectionalLight(0xFF0000, 1.0, 0);
    light.position.set(100, 100, 200);
    scene.add(light);
}

let cube;
function initObject() {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

function render() {
    requestAnimationFrame(render);
    renderer.clear();
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

function threeStart() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();

    render();
}