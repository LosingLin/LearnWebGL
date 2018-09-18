
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    // uniform vec4 u_Translation;
    // x' = x*cos b - y * sin b;
    // y' = x*sin b + y * cos b;
    // z' = z;
    uniform float u_CosB, u_SinB;
    void main() {
        // gl_Position = a_Position + u_Translation;
        gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
        gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
        gl_Position.z = a_Position.z;
        gl_Position.w = 1.0;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;
    //uniform vec4 u_FragColor;
    void main () {
        //gl_FragColor = u_FragColor;
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

    let angle = 90;
    let radian = Math.PI * angle / 180;
    let cosB = Math.cos(radian);
    let sinB = Math.sin(radian);

    let u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
    let u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');

    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

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

