
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;

    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    uniform vec3 u_LightColor;
    uniform vec3 u_LightDirection;
    uniform vec3 u_AmbientLight;

    varying vec4 v_Color;

    void main() {
        gl_Position = u_MvpMatrix * a_Position;

        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        float nDotL = max(dot(u_LightDirection, normal), 0.0);

        // diffuse
        vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;

        // ambient
        vec3 ambient = u_AmbientLight * a_Color.rgb;

        v_Color = vec4(diffuse + ambient, a_Color.a);
    }
`;

let FSHADER_SOURCE = `
#ifdef GL_ES
    precision mediump float;
#endif

    varying vec4 v_Color;

    void main () {
        gl_FragColor = v_Color;
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
    let u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    let u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    let u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    let u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    // set light color
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // set light direction
    let lightDirection = new Vector3([0.5, 3.0, 4.0]);
    lightDirection.normalize();
    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    // set ambient
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    let modelMatrix = new Matrix4();
    let viewMatrix = new Matrix4();
    let projMatrix = new Matrix4();

    let mvpMatrix = new Matrix4();
    let normalMatrix = new Matrix4();

    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    
    document.onkeydown = function(ev) {
        keydown(ev);
    }

    let render = function() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix);
        requestAnimationFrame(render);
    }
    render();

    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

let g_near = 1.0, g_far = 100.0;
let g_eyeX = 0.0, g_eyeY= 0.0, g_eyeZ = 10.0;

let g_mx = 0.0, g_my = 0.0, g_mz = 0.0;

let g_rotation = 0;
function keydown(ev) {
    switch (ev.keyCode) {
        case 39: g_near += 1; break;  //按下右方向键
        case 37: g_near -= 1; break;  //按下左方向键
        case 38: g_far += 1; break;  //按下上方向键
        case 40: g_far -= 1; break;  //按下下方向键

        case 87: g_my += 0.05; break;   //w
        case 83: g_my -= 0.05; break;   //s
        case 65: g_mx -= 0.05; break;     // a
        case 68: g_mx += 0.05; break;     //d
        case 90: g_mz += 0.05; break;     // z
        case 88: g_mz -= 0.05; break;     //x

        default:
            break;
    }
    // draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix);

    let nf = document.getElementById('htmlLog');
    nf.innerHTML = 'near : ' + g_near + ';   far : ' + g_far + ';';
}

function draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix) {
    // console.log(' --- projMatrix : ', projMatrix);

    // viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    // viewMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
    g_rotation += 2;
    modelMatrix.setTranslate(g_mx, g_my, g_mz).rotate(g_rotation, 1, 1, 0);
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, -1, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width/canvas.height, g_near, g_far);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    // 计算模型矩阵的逆转置矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    // gl.polygonOffset(1.0, 1.0);
    // gl.drawArrays(gl.TRIANGLES, n/2, n/2);

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
    let vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
       -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
       -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
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

    if (!initArrayBuufer(gl, vertices, 3, gl.FLOAT, 'a_Position')) {
        return -1;
    }
    if (!initArrayBuufer(gl, colors, 3, gl.FLOAT, 'a_Color')) {
        return -1;
    }
    if (!initArrayBuufer(gl, normals, 3, gl.FLOAT, 'a_Normal')) {
        return -1;
    }


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuufer(gl, data, num, type, attribute) {
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

