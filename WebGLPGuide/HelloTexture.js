
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    uniform mat4 u_ModelMatrix;
    varying vec2 v_TexCoord;
    void main() {
        gl_Position = u_ModelMatrix * a_Position;
        v_TexCoord = a_TexCoord;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Sampler2;
    void main () {
        vec4 color = texture2D(u_Sampler, v_TexCoord);
        vec4 color2 = texture2D(u_Sampler2, v_TexCoord);
        gl_FragColor = color * color2;
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let modelMatrix = new Matrix4();

    let image = initTexture(gl, n);

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
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0,
    ]);

    let n = 4;

    let vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    let a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');

    let FSIZE = vertices.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}


function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    modelMatrix.setRotate(currentAngle, 0.0, 0.0, 1.0);
    modelMatrix.translate(0.35, 0.0, 0.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.TRIANGLES, 0, n);
    if (loadCount == 2) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}

let g_last = Date.now();
function animate(angle) {
    let now = Date.now();
    let elapsed = now - g_last;
    g_last = now;

    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

let loadCount = 0;
function initTexture(gl, n) {
    let texture = gl.createTexture();
    let texture2 = gl.createTexture();

    let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    let u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');

    let image = new Image();
    image.onload = function() {
        loadCount ++;
        loadTexture(gl, n, texture, u_Sampler, image, 0);
    }
    let image2 = new Image();
    image2.onload = function() {
        loadCount ++;
        loadTexture(gl, n, texture2, u_Sampler2, image2, 1);
    }

    image.src = './resources/sky.jpg';
    image2.src = './resources/circle.gif';
    return image;
}


function loadTexture(gl, n, texture, u_Sampler, image, textureIndex) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);     //对纹理图像进行y轴反转

    if (textureIndex == 0) {
        gl.activeTexture(gl.TEXTURE0); //开启0号纹理单元
    } else {
        gl.activeTexture(gl.TEXTURE1); //开启1号纹理单元
    }
    

    gl.bindTexture(gl.TEXTURE_2D, texture); //绑定纹理

    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    
    if (textureIndex == 0) {
        gl.uniform1i(u_Sampler, 0);
    } else {
        gl.uniform1i(u_Sampler, 1);
    }
}

