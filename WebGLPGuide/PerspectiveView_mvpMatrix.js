
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_MvpMatrix;
    
    varying vec4 v_Color;

    void main() {
        gl_Position = u_MvpMatrix * a_Position;
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

    let n = initVertexBuffers(gl);

    let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

    let modelMatrix = new Matrix4();
    let viewMatrix = new Matrix4();
    let projMatrix = new Matrix4();

    let mvpMatrix = new Matrix4();

    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    
    document.onkeydown = function(ev) {
        keydown(ev, gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix);
    }

    let render = function() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix);
        requestAnimationFrame(render);
    }
    render();

    

    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

let g_near = 1.0, g_far = 100.0;
let g_eyeX = 0.0, g_eyeY= 0.0, g_eyeZ = 5.0;

let g_mx = 0.0, g_my = 0.0, g_mz = 0.0;
function keydown(ev, gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix) {
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

function draw(gl, n, modelMatrix, viewMatrix, projMatrix, u_MvpMatrix, mvpMatrix) {

    // console.log(' --- projMatrix : ', projMatrix);

    // viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    // viewMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, g_near, g_far);
    modelMatrix.setTranslate(g_mx, g_my, g_mz);
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, -1, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width/canvas.height, g_near, g_far);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);
    
}

function initVertexBuffers (gl) {
    var vertices = new Float32Array([
        // Three triangles on the right side
        0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        0.25, -1.0,   0.0,  0.4,  0.4,  1.0,
        1.25, -1.0,   0.0,  1.0,  0.4,  0.4,

        0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
        0.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
        1.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

        0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
        0.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
        1.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

        // Three triangles on the left side
        -0.75,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
        -1.25, -1.0,  -4.0,  0.4,  1.0,  0.4,
        -0.25, -1.0,  -4.0,  1.0,  0.4,  0.4, 

        -0.75,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
        -1.25, -1.0,  -2.0,  1.0,  1.0,  0.4,
        -0.25, -1.0,  -2.0,  1.0,  0.4,  0.4, 

        -0.75,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
        -1.25, -1.0,   0.0,  0.4,  0.4,  1.0,
        -0.25, -1.0,   0.0,  1.0,  0.4,  0.4,  
    ]);

    let n = 18;

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

