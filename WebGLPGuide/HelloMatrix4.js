
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_xformMatrix;
    void main() {
        gl_Position = u_xformMatrix * a_Position;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main () {
        gl_FragColor = u_FragColor;
        // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

    
    let n = initVertexBuffers(gl);
    let angle = 90;
    let u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let xformMatrix = new Matrix4();
    xformMatrix.setRotate(angle, 0, 0, 1);
    xformMatrix.translate(0.5, 0, 0);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    xformMatrix = new Matrix4();
    xformMatrix.setTranslate(0.5, 0.0, 0.0);
    xformMatrix.rotate(angle, 0, 0, 1);
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
    gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}

function initVertexBuffers (gl) {
    let vertices = new Float32Array([
        -0.5, -0.5, 0.0, 0.5,  0.5, -0.5,
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

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    return n;
}

