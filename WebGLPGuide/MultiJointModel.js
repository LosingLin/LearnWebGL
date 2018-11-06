
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    
    varying vec4 v_Color;
    varying vec3 v_Normal;
    varying vec3 v_Position;

    void main() {
        gl_Position = u_MvpMatrix * a_Position;

        v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));

        // 顶点的世界坐标
        v_Position = vec3(u_ModelMatrix * a_Position);

        v_Color = a_Color;
    }
`;

let FSHADER_SOURCE = `
#ifdef GL_ES
    precision mediump float;
#endif

    uniform vec3 u_LightColor;
    uniform vec3 u_LightPosition;
    uniform vec3 u_AmbientLight;    

    varying vec4 v_Color;
    varying vec3 v_Normal;
    varying vec3 v_Position;

    void main () {
        // 对法线进行归一化，因为其内插以后长度不一定为1
        vec3 normal = normalize(v_Normal);

        //
        vec3 lightDirection = normalize(u_LightPosition - v_Position);

        float nDotL = max(dot(lightDirection, normal), 0.0);

        vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
        vec3 ambient = u_AmbientLight * v_Color.rgb;

        gl_FragColor = vec4(diffuse + ambient, v_Color.a);
        // gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    }
`;

let canvas = null;
function main() {
    canvas = document.getElementById('webgl');

    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);

    let n = initVertexBuffers(gl);

    let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    // let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    let u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    // set light color
    gl.uniform3f(u_LightColor, 0.9, 0.9, 0.9);
    // set light direction
    // let lightDirection = new Vector3([0.5, 3.0, 4.0]);
    // lightDirection.normalize();
    // gl.uniform3fv(u_LightDirection, lightDirection.elements);

    // set light position
    gl.uniform3f(u_LightPosition, 0.0, 30.0, 40.0);

    // set ambient
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    let modelMatrix = new Matrix4();
    let viewMatrix = new Matrix4();
    let projMatrix = new Matrix4();

    let mvpMatrix = new Matrix4();
    let normalMatrix = new Matrix4();

    viewMatrix.setLookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    projMatrix.setPerspective(50.0, canvas.width/canvas.height, 1.0, 100.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    
    document.onkeydown = function(ev) {
        keydown(ev);
    }

    console.log('----- n : ', n);

    let render = function() {

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix, u_ModelMatrix);
        requestAnimationFrame(render);
    }
    render();

    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

let ANGLE_STEP = 3.0;
let g_arm1Angle = -90.0;
let g_joint1Angle = 0.0;
let g_joint2Angle = 0.0;

function keydown(ev) {
    switch (ev.keyCode) {
        case 39: //按下右方向键
            g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
            break;
        case 37: //按下左方向键
            g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
            break;
        case 38: //按下上方向键
            if (g_joint1Angle < 135.0) {
                g_joint1Angle += ANGLE_STEP;
            }
            break;  
        case 40: //按下下方向键
            if (g_joint1Angle > -135.0) {
                g_joint1Angle -= ANGLE_STEP;
            }
            break;

        default:
            break;
    }
    // draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix);

    // let nf = document.getElementById('htmlLog');
    // nf.innerHTML = 'near : ' + g_near + ';   far : ' + g_far + ';';
}

function draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix, u_ModelMatrix) {

    console.log('------    g_arm1Angle :', g_arm1Angle);
    
    // base
    let baseHeight = 2.0;
    modelMatrix.setTranslate(0.0, -12.0, 0.0);
    pushMatrix(modelMatrix);
    modelMatrix.scale(10.0, baseHeight, 10.0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // 计算模型矩阵的逆转置矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    drawBox(gl, n, u_MvpMatrix, mvpMatrix, u_ModelMatrix, modelMatrix, u_NormalMatrix, normalMatrix);

    // arm1
    let arm1Length = 10.0;
    modelMatrix = popMatrix()
    modelMatrix.translate(0.0, baseHeight, 0.0);
    modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    pushMatrix(modelMatrix);
    modelMatrix.scale(3.0, arm1Length, 3.0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // 计算模型矩阵的逆转置矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    drawBox(gl, n, u_MvpMatrix, mvpMatrix, u_ModelMatrix, modelMatrix, u_NormalMatrix, normalMatrix);

    // arm2
    let arm2Length = 10.0;
    modelMatrix = popMatrix();
    modelMatrix.translate(0.0, arm1Length, 0.0);
    modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
    pushMatrix(modelMatrix);
    modelMatrix.scale(2.0, arm2Length, 6.0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // 计算模型矩阵的逆转置矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    drawBox(gl, n, u_MvpMatrix, mvpMatrix, u_ModelMatrix, modelMatrix, u_NormalMatrix, normalMatrix);

    // a palm
    let palmLength = 2.0;
    modelMatrix = popMatrix();
    modelMatrix.translate(0.0, arm2Length, 0.0);
    modelMatrix.rotate(g_joint2Angle, 0.0, 0.0, 1.0);
    pushMatrix(modelMatrix);
    modelMatrix.scale(2.0, palmLength, 6.0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // 计算模型矩阵的逆转置矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    drawBox(gl, n, u_MvpMatrix, mvpMatrix, u_ModelMatrix, modelMatrix, u_NormalMatrix, normalMatrix);

    //
    modelMatrix = popMatrix();
    modelMatrix.translate(0.0, palmLength, 0.0);

    // finger1
    
}

function drawBox(gl, n, u_MvpMatrix, mvpMatrix, u_ModelMatrix, modelMatrix, u_NormalMatrix, normalMatrix) {
    // console.log('------    drawBox');
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}

function initVertexBuffers (gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let vertices = new Float32Array([
        1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
        1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
        1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
       -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
       -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
        1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
      ]);
   
    let colors = new Float32Array([     // Colors
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v3-v4-v5 right(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v0-v5-v6-v1 up(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down(white)
        1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0   // v4-v7-v6-v5 back(white)
    ]);

    let normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
       -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
   
    let indices = new Uint8Array([       // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23     // back
    ]);

    let indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) {
        return -1;
    }
    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color')) {
        return -1;
    }
    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) {
        return -1;
    }


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    let buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object.');
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    let a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed get the storage location of ' + attribute);
        return false;
    }

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}


let g_matrixStack = [];
function pushMatrix(m) {
    let m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}
function popMatrix() {
    return g_matrixStack.pop();
}
