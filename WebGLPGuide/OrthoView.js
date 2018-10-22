
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_ViewMatrix;
    
    varying vec4 v_Color;

    void main() {
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color;
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

function main() {
    let canvas = document.getElementById('webgl');

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

    

    let n = initVertexBuffers(gl);

    let u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

    let viewMatrix = new Matrix4();
    
    document.onkeydown = function(ev) {
        keydown(ev, gl, n, u_ViewMatrix, viewMatrix);
    }

    draw(gl, n, u_ViewMatrix, viewMatrix);

    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

let g_near = 0.0, g_far = 100.0;
let g_eyeX = 0.25, g_eyeY= 0.25, g_eyeZ = 0.25;
function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    // console.log('------ ev.keyCode : ', ev.keyCode);
    switch (ev.keyCode) {
        case 39: g_near += 0.01; break;  //按下右方向键
        case 37: g_near -= 0.01; break;  //按下左方向键
        case 38: g_far += 0.01; break;  //按下上方向键
        case 40: g_far -= 0.01; break;  //按下下方向键

        case 87: g_eyeX += 0.01; break;   //w
        case 83: g_eyeX -= 0.01; break;   //s
        case 65: g_eyeY += 0.01; break;     // a
        case 68: g_eyeY -= 0.01; break;     //d
        case 90: g_eyeZ += 0.01; break;     // z
        case 88: g_eyeZ -= 0.01; break;     //x
        default:
            break;
    }
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function draw(gl, n, u_ViewMatrix, viewMatrix) {

    // viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    viewMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
    viewMatrix.lookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, -1, 0, 1, 0);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    let nf = document.getElementById('htmlLog');
    nf.innerHTML = 'near : ' + g_near + ';   far : ' + g_far + ';';
}

function initVertexBuffers (gl) {
    var vertices = new Float32Array([
    // Vertex coordinates and color(RGBA)
        0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
        -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
        0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
    
        0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
        -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
        0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

        0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
        0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
    ]);

    let n = 9;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let FSize = vertices.BYTES_PER_ELEMENT;
    
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSize * 6, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSize * 6, FSize * 3);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);

    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
}

