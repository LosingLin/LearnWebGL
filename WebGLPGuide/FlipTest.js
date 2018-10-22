
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec3 a_Color;

    uniform float u_CurAngle;

    varying vec3 v_Color;
    varying float v_needShowBack;
    varying vec3 v_Position;

    varying vec3 v_newPosition;

    const float PI = 3.14159265;
    void main() {
        // gl_Position = u_xformMatrix * a_Position;

        float angle = u_CurAngle;
        float theta = angle * PI;

        vec4 temp = a_Position;

        if (temp.x > 0.0) {
            if (temp.y > 0.0) {
                temp.y = temp.y + sin(angle) * 0.1;
            } else {
                temp.y = temp.y - sin(angle) * 0.1;
            }

            temp.x = temp.x - (1.0 + cos(angle)) * 0.5;

            v_needShowBack = 1.0;
        } else {
            v_needShowBack = 0.0;
        }
        
        // temp.x += u_CurAngle;
        // temp.y += u_CurAngle;

        v_Position = a_Position.xyz;
        v_newPosition = temp.xyz;

        v_Color = a_Color;
        // v_Color.r += u_CurAngle;
        // v_Color.g += u_CurAngle;
        // v_Color.b += u_CurAngle;


        gl_Position = temp;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;

    varying vec3 v_Color;
    varying float v_needShowBack;
    varying vec3 v_Position;
    varying vec3 v_newPosition;

    void main () {

        //gl_FragColor = u_FragColor;
        // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

        if (v_Position.x > 0.0 && v_newPosition.x < 0.0) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        } else {
            gl_FragColor = vec4(v_Color, 1.0);
        }
    }
`;


let ANGLE_STEP = 45.0;
let angle = 0.0;
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
    // let currentAngle = 0.0;
    // let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    // let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    // gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    let u_CurAngle = gl.getUniformLocation(gl.program, 'u_CurAngle');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let modelMatrix = new Matrix4();

    let tick = function () {
        angle = animate();
        draw(gl, n, angle, u_CurAngle);
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
        -0.5, 0.5, 0.0, 1.0, 0.0,
        -0.5, -0.5, 1.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 1.0, 1.0,

        0.0, 0.5, 0.0, 1.0, 1.0,
        -0.5, -0.5, 1.0, 0.0, 0.0,
        0.0, -0.5, 0.0, 0.0, 0.0,

        0.0, 0.5, 0.0, 1.0, 1.0,
        0.0, -0.5, 0.0, 0.0, 0.0,
        0.5, 0.5, 0.0, 0.0, 1.0,

        0.5, 0.5, 0.0, 0.0, 1.0,
        0.0, -0.5, 0.0, 0.0, 0.0,
        0.5, -0.5, 1.0, 1.0, 0.0,
    ]);

    let n = 12;

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
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);

    return n;
}


function draw(gl, n, currentAngle, u_CurAngle) {

    gl.uniform1f(u_CurAngle, currentAngle);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

let g_last = Date.now();
function animate() {
    let now = Date.now();
    let elapsed = now - g_last;
    g_last = now;

    // let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    // return newAngle % 360;
    angle = angle - 0.02;
    console.log('-- angle : ', angle);
    return angle;
}

