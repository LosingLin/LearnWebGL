
let VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;

uniform mat4 u_MvpMatrix;

varying vec2 v_TexCoord;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_TexCoord = a_TexCoord;
}
`;

let FSHADER_SOURCE = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
uniform bool u_Clicked;

varying vec2 v_TexCoord;

void main() {
    if (u_Clicked) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
}
`;

function main () {
    let canvas = document.getElementById('webgl');

    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context of WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    let n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to get the vertex information');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);


    let u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    let u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
    if (!u_MvpMatrix || !u_Clicked) {
        console.log('Failed to get the storage location of uniform variable');
        return;
    }

    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_Clicked, 0);

    let currentAngle = [0.0, 0.0];
    // initEventHandlers(canvas, currentAngle);

    // event
    canvas.onmousedown = function(ev) {
        let x = ev.clientX, y = ev.clientY;
        
        let rect = ev.target.getBoundingClientRect();
        console.log('-----rect : ', rect);
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {

            let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            let picked = check(gl, n, x_in_canvas, y_in_canvas, viewProjMatrix, u_MvpMatrix, currentAngle, u_Clicked);
            if (picked) {
                // alert('The cube was selected!');
            }
        }
    }

    if (!initTextures(gl)) {
        console.log('Failed to initialize the texture');
        return;
    }

    let tick = function() {
        draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle, u_Clicked);
        requestAnimationFrame(tick, canvas);
    }
    tick();
}

function check(gl, n, x, y, viewProjMatrix, u_MvpMatrix, currentAngle, u_Clicked) {
    let picked = false;
    gl.uniform1i(u_Clicked, 1);
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);

    let pixels = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels[0] == 255) {
        picked = true;
    }
    gl.uniform1i(u_Clicked, 0);
    draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle);

    return picked;
}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    let vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);

    let texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    let indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    // Create a buffer object
    let indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
    return -1;
    }

    // Write vertex information to buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
    if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    // Create a buffer object
    let buffer = gl.createBuffer();
    if (!buffer) {
      console.log('Failed to create the buffer object');
      return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    let a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
      console.log('Failed to get the storage location of ' + attribute);
      return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute variable
    gl.enableVertexAttribArray(a_attribute);
  
    return true;
}

function initEventHandlers(canvas, currentAngle) {
    let dragging = false;
    let lastX = -1, lastY = -1;

    canvas.onmousedown = function(ev) {
        let x = ev.clientX, y = ev.clientY;
        
        let rect = ev.target.getBoundingClientRect();
        console.log('-----rect : ', rect);
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x;
            lastY = y;
            dragging = true;

            let x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            
        }
    }

    canvas.onmouseup = function(ev) {
        dragging = false;
    }

    canvas.onmousemove = function(ev) {
        let x = ev.clientX, y = ev.clientY;
        if (dragging) {
            let factor = 100 / canvas.height;
            let dx = factor * (x - lastX);
            let dy = factor * (y - lastY);

            // limit x-axis rotation angle to -90 to 90 degrees
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;
        }

        lastX = x;
        lastY = y;
    }
}

let g_MvpMatrix = new Matrix4();
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
    // Caliculate The model view projection matrix and pass it to u_MvpMatrix
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
    g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
}

function initTextures(gl) {
    let texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    let image = new Image();
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }

    image.onload = function() {
        loadTexture(gl, texture, u_Sampler, image);
    };
    image.src = './resources/sky.jpg';
    return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(u_Sampler, 0);
}

