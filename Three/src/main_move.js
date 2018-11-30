

let canvasFrame = document.getElementById('canvas-frame');
let width = canvasFrame.clientWidth;
let height = canvasFrame.clientHeight;

let renderer;
function initThree() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    canvasFrame.appendChild(renderer.domElement);
    renderer.setClearColor(0xFFFFFF, 1.0);
}

let camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width/height, 1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 1000;

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

let mesh;
function initObject() {
    let geometry = new THREE.CylinderGeometry(100, 150, 400);
    let material = new THREE.MeshLambertMaterial({color: 0xFFFF00});
    mesh = new THREE.Mesh(geometry, material);

    mesh.position = new THREE.Vector3(0, 0, 0);
    scene.add(mesh);
}

function animate() {
    renderer.clear();
    // camera.position.x = camera.position.x + 1;
    mesh.position.x -= 1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function threeStart() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();

    animate();
}