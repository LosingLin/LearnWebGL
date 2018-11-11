let SOLID_VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;

    varying vec4 v_Color;

    void main () {
        vec3 lightDirection = vec3(0.0, 0.0, 1.0);
        vec4 color = vec4(0.0, 1.0, 1.0, 1.0);

        gl_Position = u_MvpMatrix * a_Position;

        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        float nDotL = max(dot(normal, lightDirection), 0.0);
        
        v_Color = vec4(color.rgb * nDotL, color.a);
    }
`;

let SOLID_FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    varying vec4 v_Color;

    void main () {
        gl_FragColor = v_Color;
    }
`;

let TEXTURE_VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    attribute vec2 a_TexCoord;

    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;

    varying float v_NdotL;
    varying vec2 v_TexCoord;
    
    void main() {
        vec3 lightDirection = vec3(0.0, 0.0, 1.0);
        gl_Position = u_MvpMatrix * a_Position;

        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        v_NdotL = max(dot(normal, lightDirection), 0.0);

        v_TexCoord = a_TexCoord;
    }
`;

let TEXTURE_FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform sampler2D u_Sampler;
    
    varying vec2 v_TexCoord;
    varying float v_NdotL;

    void main() {
        vec4 color = texture2D(u_Sampler, v_TexCoord);
        gl_FragColor = vec4(color.rgb * v_NdotL, color.a);
    }
`;

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
    
    varying vec2 v_TexCoord;

    void main() {
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
`;

let OFFSCREEN_WIDTH = 256;
let OFFSCREEN_HEIGHT = 256;

function main() {
    let canvas = document.getElementById('webgl');

    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context of canvas');
        return;
    }

    let solidProgram = createProgram(gl, SOLID_VSHADER_SOURCE, SOLID_FSHADER_SOURCE);
    let texProgram = createProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
    let frameProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);


    // Get storage locations of attribute and uniform variables in program object for single color drawing
    solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position');
    solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal');
    solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix');
    solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix');

    // Get storage locations of attribute and uniform variables in program object for texture drawing
    texProgram.a_Position = gl.getAttribLocation(texProgram, 'a_Position');
    texProgram.a_Normal = gl.getAttribLocation(texProgram, 'a_Normal');
    texProgram.a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
    texProgram.u_MvpMatrix = gl.getUniformLocation(texProgram, 'u_MvpMatrix');
    texProgram.u_NormalMatrix = gl.getUniformLocation(texProgram, 'u_NormalMatrix');
    texProgram.u_Sampler = gl.getUniformLocation(texProgram, 'u_Sampler');

    // Get storage location of attribute and uniform variables
    frameProgram.a_Position = gl.getAttribLocation(frameProgram, 'a_Position');
    frameProgram.a_TexCoord = gl.getAttribLocation(frameProgram, 'a_TexCoord');
    frameProgram.u_MvpMatrix = gl.getUniformLocation(frameProgram, 'u_MvpMatrix');
    frameProgram.u_Sampler = gl.getUniformLocation(frameProgram, 'u_Sampler');

    let plane = initVertexBuffersForPlane(gl);
    let cube = initVertexBuffers(gl);

    let texture = initTextures(gl, texProgram);

    // initialize framebuffer object (FBO)
    let fbo = initFrameBufferObject(gl);


    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let viewProjMatrixPlane = new Matrix4();
    viewProjMatrixPlane.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrixPlane.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 15.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    let currentAngle = 0.0;
    let render = function() {

        // draw to framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

        gl.clearColor(0.2, 0.2, 0.4, 1.0);
        currentAngle = animate(currentAngle);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawSolidCube(gl, solidProgram, cube, -2.0, currentAngle, viewProjMatrix);
        drawTexCube(gl, texProgram, cube, texture, 2.0, currentAngle, viewProjMatrix);


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);

        // draw to texture
        gl.clearColor(0,0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(frameProgram);
        gl.uniform1i(frameProgram.u_Sampler, 0);

        g_modelMatrix.setTranslate(0.0, 0.0, 1.0);
        g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
        g_modelMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);

        g_mvpMatrix.set(viewProjMatrixPlane);
        g_mvpMatrix.multiply(g_modelMatrix);
        gl.uniformMatrix4fv(frameProgram.u_MvpMatrix, false, g_mvpMatrix.elements);

        initAttributeVariable(gl, frameProgram.a_Position, plane.vertexBuffer);
        initAttributeVariable(gl, frameProgram.a_TexCoord, plane.texCoordBuffer);

        gl.activeTexture(gl.TEXTURE0);
        if (fbo.texture) {
            gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        }

        // console.log('---- texture : ', texture);
        // console.log('---- fbo.texture : ', fbo.texture);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, plane.indexBuffer);
        gl.drawElements(gl.TRIANGLES, plane.numIndices, plane.indexBuffer.type, 0);

        requestAnimationFrame(render, canvas);
    }

    render();
}

function initFrameBufferObject(gl) {
    let framebuffer;
    let texture;
    let depthBuffer;

    let error = function() {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    // create a frame buffer object
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }

    // create 
    texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    framebuffer.texture = texture;

    // create a renderbuffer object and set its size
    depthBuffer = gl.createRenderbuffer();
    if (!depthBuffer) {
        console.log('Faild to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

    // attach the texture and the renderbuffer object to the FBO

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
    let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
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

    let normals = new Float32Array([   // Normal
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,     // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0      // v4-v7-v6-v5 back
    ]);

    var texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    let indices = new Uint8Array([        // Indices of the vertices
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    let o = {};

    // Write vertex information to buffer object
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
    o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if (!o.vertexBuffer || !o.normalBuffer || !o.texCoordBuffer || !o.indexBuffer) return null; 

    o.numIndices = indices.length;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
    let buffer = gl.createBuffer();   // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    // Keep the information necessary to assign to the attribute variable later
    buffer.num = num;
    buffer.type = type;

    return buffer;
}

function initVertexBuffersForPlane(gl) {
    // Create face
    //  v1------v0
    //  |        | 
    //  |        |
    //  |        |
    //  v2------v3

    // Vertex coordinates
    let vertices = new Float32Array([
        1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0    // v0-v1-v2-v3
    ]);

    // Texture coordinates
    let texCoords = new Float32Array([1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0]);

    // Indices of the vertices
    let indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

    let o = {};

    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);

    o.numIndices = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  let buffer = gl.createBuffer();　  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

function initTextures(gl, program) {
    let texture = gl.createTexture();

    let image = new Image();

    image.onload = function() {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    image.src = '../resources/orange.jpg';
    
    return texture;
}

function drawSolidCube(gl, program, o, x, angle, viewProjMatrix) {
    gl.useProgram(program);

    // gl.uniform1i(program.u_Sampler, 0);

    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
    initAttributeVariable(gl, program.a_Normal, o.normalBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

    drawCube(gl, program, o, x, angle, viewProjMatrix);
}

function drawTexCube(gl, program, o, texture, x, angle, viewProjMatrix) {
    gl.useProgram(program);   // Tell that this program object is used

    gl.uniform1i(program.u_Sampler, 0);

    // Assign the buffer objects and enable the assignment
    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);  // Vertex coordinates
    initAttributeVariable(gl, program.a_Normal, o.normalBuffer);    // Normal
    initAttributeVariable(gl, program.a_TexCoord, o.texCoordBuffer);// Texture coordinates
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer); // Bind indices

    // Bind texture object to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    drawCube(gl, program, o, x, angle, viewProjMatrix); // Draw
}

function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

let g_modelMatrix = new Matrix4();
let g_mvpMatrix = new Matrix4();
let g_normalMatrix = new Matrix4();
function drawCube(gl, program, o, x, angle, viewProjMatrix) {
    g_modelMatrix.setTranslate(x, 0.0, 0.0);
    g_modelMatrix.rotate(20.0, 1.0, 0.0, 0.0);
    g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0);
}

let ANGLE_STEP = 30;

let last = Date.now();
function animate(angle) {
    let now = Date.now();
    let elapsed = now - last;
    last = now;

    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

    return newAngle % 360;
}


