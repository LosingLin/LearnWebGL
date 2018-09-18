
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ModelMatrix;
    varying vec4 v_Color;
    void main() {
        gl_Position = u_ModelMatrix * a_Position;
        v_Color = a_Color;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main () {
        gl_FragColor = vec4(gl_FragCoord.x/400.0, 0.0, gl_FragCoord.y/400.0, 1.0);
    }
`;


let ANGLE_STEP = 45.0;
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

    
    let n = initVertexBuffers(gl);
    let currentAngle = 0.0;
    let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let modelMatrix = new Matrix4();

    let tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
        requestAnimationFrame(tick);
    };
    tick();
    


    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

function initVertexBuffers (gl) {
    let vertices = new Float32Array([
        -0.5, -0.5, 1.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 1.0, 0.0, 
        0.5, -0.5, 0.0, 0.0, 1.0,
        // -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5
    ]);

    let n = 3;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    let FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    return n;
}


function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    modelMatrix.setRotate(currentAngle, 0.0, 0.0, 1.0);
    modelMatrix.translate(0.35, 0.0, 0.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

let g_last = Date.now();
function animate(angle) {
    let now = Date.now();
    let elapsed = now - g_last;
    g_last = now;

    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

