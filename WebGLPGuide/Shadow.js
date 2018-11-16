
let SHADOW_VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_MvpMatrix;

    varying vec4 v_Color;

    void main () {
        gl_Position = u_MvpMatrix * a_Position;

        v_Color = a_Color;
    }
`;

let SHADOW_FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    varying vec4 v_Color;

    void main () {
        gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
        // gl_FragColor = v_Color;
    }
`;

let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;

    uniform mat4 u_MvpMatrix;
    uniform mat4 u_MvpMatrixFromLight;

    varying vec4 v_PositionFromLight;
    varying vec4 v_Color;

    void main () {
        gl_Position = u_MvpMatrix * a_Position;
        v_PositionFromLight = u_MvpMatrixFromLight * a_Position;
        v_Color = a_Color;
    }
`;

let FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform sampler2D u_ShadowMap;

    varying vec4 v_PositionFromLight;
    varying vec4 v_Color;

    void main () {
        vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w) / 2.0 + 0.5;
        vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
        float depth = rgbaDepth.r;
        float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;

        gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
    }
`;

let OFFSCREEN_WIDTH = 2048;
let OFFSCREEN_HEIGHT = 2048;

let LIGHT_X = 0;
let LIGHT_Y = 7;
let LIGHT_Z = 2;

function main () {
    let canvas = document.getElementById('webgl');

    let gl = getWebGLContext(canvas);
    
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    let shadowProgram = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE);
    shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, 'a_Position');
    shadowProgram.a_Color = gl.getAttribLocation(shadowProgram, 'a_Color');
    shadowProgram.u_MvpMatrix = gl.getUniformLocation(shadowProgram, 'u_MvpMatrix');
    if (shadowProgram.a_Position < 0 || !shadowProgram.u_MvpMatrix) {
        console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram'); 
        return;
    }

    let normalProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    normalProgram.a_Position = gl.getAttribLocation(normalProgram, 'a_Position');
    normalProgram.a_Color = gl.getAttribLocation(normalProgram, 'a_Color');
    normalProgram.u_MvpMatrix = gl.getUniformLocation(normalProgram, 'u_MvpMatrix');
    normalProgram.u_MvpMatrixFromLight = gl.getUniformLocation(normalProgram, 'u_MvpMatrixFromLight');
    normalProgram.u_ShadowMap = gl.getUniformLocation(normalProgram, 'u_ShadowMap');
    if (normalProgram.a_Position < 0 || normalProgram.a_Color < 0 || !normalProgram.u_MvpMatrix ||
        !normalProgram.u_MvpMatrixFromLight || !normalProgram.u_ShadowMap) {
        console.log('Failed to get the storage location of attribute or uniform variable from normalProgram'); 
        return;
    }
  
    let triangle = initVertexBuffersForTriangle(gl);
    let plane = initVertexBuffersForPlane(gl);

    let fbo = initFramebufferObject(gl);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    let viewProjMatrixFromLight = new Matrix4();
    viewProjMatrixFromLight.setPerspective(70.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0);
    viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(45.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    let currentAngle = 0.0;
    let mvpMatrixFromLight_t = new Matrix4();
    let mvpMatrixFromLight_p = new Matrix4();

    let tick = function () {
        currentAngle = animate(currentAngle);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shadowProgram);

        drawTriangle(gl, shadowProgram, triangle, currentAngle, viewProjMatrixFromLight);
        mvpMatrixFromLight_t.set(g_mvpMatrix);
        drawPlane(gl, shadowProgram, plane, viewProjMatrixFromLight);
        mvpMatrixFromLight_p.set(g_mvpMatrix);


        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(normalProgram);
        gl.uniform1i(normalProgram.u_ShadowMap, 0);

        gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_t.elements);
        drawTriangle(gl, normalProgram, triangle, currentAngle, viewProjMatrix);
        gl.uniformMatrix4fv(normalProgram.u_MvpMatrixFromLight, false, mvpMatrixFromLight_p.elements);
        drawPlane(gl, normalProgram, plane, viewProjMatrix);

        requestAnimationFrame(tick, canvas);
    }

    tick();

}

// Coordinate transformation matrix
let g_modelMatrix = new Matrix4();
let g_mvpMatrix = new Matrix4();
function drawTriangle(gl, program, triangle, angle, viewProjMatrix) {
    // Set rotate angle to model matrix and draw triangle
    g_modelMatrix.setRotate(angle, 0, 1, 0);
    draw(gl, program, triangle, viewProjMatrix);
}

function drawPlane(gl, program, plane, viewProjMatrix) {
    // Set rotate angle to model matrix and draw plane
    g_modelMatrix.setRotate(-45, 0, 1, 1);
    draw(gl, program, plane, viewProjMatrix);
}

function draw(gl, program, o, viewProjMatrix) {
    initAttributeVariable(gl, program.a_Position, o.vertexBuffer);
    if (program.a_Color != undefined) // If a_Color is defined to attribute
        initAttributeVariable(gl, program.a_Color, o.colorBuffer);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);

    // Calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0);
}

// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}


function initFramebufferObject(gl) {
    let framebuffer;
    let texture;
    let depthBuffer;

    let error = function() {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }
    

    texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    depthBuffer = gl.createRenderbuffer();
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER, framebuffer);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    framebuffer.texture = texture;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
}


function initVertexBuffersForTriangle(gl) {
    // Create a triangle
    //       v2
    //      / | 
    //     /  |
    //    /   |
    //  v0----v1

    // Vertex coordinates
    let vertices = new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8]);
    // Colors
    let colors = new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0]);    
    // Indices of the vertices
    let indices = new Uint8Array([0, 1, 2]);

    let o = {};

    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);

    o.numIndices = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return o;
}

function initVertexBuffersForPlane(gl) {
    // Create a plane
    //  v1------v0
    //  |        | 
    //  |        |
    //  |        |
    //  v2------v3
  
    // Vertex coordinates
    let vertices = new Float32Array([
      3.0, -1.7, 2.5,  -3.0, -1.7, 2.5,  -3.0, -1.7, -2.5,   3.0, -1.7, -2.5    // v0-v1-v2-v3
    ]);
  
    // Colors
    let colors = new Float32Array([
      1.0, 1.0, 1.0,    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,   1.0, 1.0, 1.0
    ]);
  
    // Indices of the vertices
    let indices = new Uint8Array([0, 1, 2,   0, 2, 3]);
  
    let o = {}; // Utilize Object object to return multiple buffer objects together
  
    // Write vertex information to buffer object
    o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
    o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
    o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
    if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 
  
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

let ANGLE_STEP = 30;

let last = Date.now();
function animate(angle) {
    let now = Date.now();
    let elapsed = now - last;
    last = now;

    let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

    return newAngle % 360;
}

