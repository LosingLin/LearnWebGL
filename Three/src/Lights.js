
let canvasFrame = document.getElementById('canvas-frame');
let width = canvasFrame.clientWidth;
let height = canvasFrame.clientHeight;

let renderer;
function initThree() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    canvasFrame.appendChild(renderer.domElement);
    renderer.setClearColor(0x0a0a0a, 1.0);
}

let camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 5;

    camera.up.x = 0;
    camera.up.y = 1;
    camera.up.z = 0;

    camera.lookAt(0, 0, 0);
}

let scene;
function initScene() {
    scene = new THREE.Scene();
}

let light;
let pointLight;
let pointLightBox;
function initLight() {
    light = new THREE.DirectionalLight(0xFFFFFF, 0.6);
    light.position.set(100, 100, 200);
    scene.add(light);

    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position.set(1, 1, 2);
    scene.add(pointLight);

    let geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    let material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    pointLightBox = new THREE.Mesh(geometry, material);
    // pointLightBox.position.set(pointLight.position);
    pointLightBox.position.set(pointLight.position.x, pointLight.position.y, pointLight.position.z);
    scene.add(pointLightBox);
}

let cube;
function initObject(x, y, z, hex) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshLambertMaterial({color: hex});
    cube = new THREE.Mesh(geometry, material);
    // cube.position = new THREE.Vector3(x, y, z);
    cube.position.set(x, y, z);
    scene.add(cube);
}

function render() {
    
    renderer.clear();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    pointLight.position.x = Math.sin(cube.rotation.x) * 2;
    pointLight.position.y = Math.cos(cube.rotation.y) * 2;

    pointLightBox.position.x = pointLight.position.x;
    pointLightBox.position.y = pointLight.position.y;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

function threeStart() {
    initThree();
    initCamera();
    initScene();

    initLight();
    initObject(1, 1, -1, 0xFFFFFF);
    initObject(1, -2, 0, 0xFF0000);
    initObject(0, 1, 3, 0x00FF00);
    initObject(0, 0, 0, 0xFFFF00);

    render();
}