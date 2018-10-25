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
    camera = new THREE.PerspectiveCamera(45, width/height, 1, 500);
    // camera.position.x = 0;
    // camera.position.y = 0;
    // camera.position.z = 5;
    camera.position.set(0, 0, 100);

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
    let geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 10, 0));
    geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    let material = new THREE.LineBasicMaterial({color: 0x0000ff});

    let line = new THREE.Line(geometry, material);
    scene.add(line);
}

function render() {
    requestAnimationFrame(render);
    renderer.clear();
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
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