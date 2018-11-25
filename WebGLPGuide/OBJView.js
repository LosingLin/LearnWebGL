let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute vec4 a_Normal;

    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;

    varying vec4 v_Color;

    void main () {
        vec3 lightDirection = vec3(-0.35, 0.35, 0.87);

        gl_Position = u_MvpMatrix * a_Position;

        vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
        float nDotL = max(dot(normal, lightDirection), 0.0);
        v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);
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

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);

    let program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    program.a_Position = gl.getAttribLocation(program, 'a_Position');
    program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
    program.a_Color = gl.getAttribLocation(program, 'a_Color');
    program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
    program.u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');

    let model = initVertexBuffers(gl, program);

    let viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 5000.0);   
    viewProjMatrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    readOBJFile('../resources/cube.obj', gl, model, 20, true);

    let currentAngle = 0.0;
    let tick = function() {
        currentAngle = animate(currentAngle);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);
        draw(gl, program, currentAngle, viewProjMatrix, model);
        requestAnimationFrame(tick, canvas);
    };
    tick();
}
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    let buffer =  gl.createBuffer();  // Create a buffer object
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

    return buffer;
}
function initVertexBuffers(gl, program) {
    let o = {};
    o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT); 
    o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();
    return o;
}

let g_modelMatrix = new Matrix4();
let g_mvpMatrix = new Matrix4();
let g_normalMatrix = new Matrix4();

function draw(gl, program, angle, viewProjMatrix, model) {
    if (g_objDoc != null && g_objDoc.isMTLComplete()) {
        g_drawingInfo = onReadComplete(gl, model, g_objDoc);
        g_objDoc = null;
    }
    if (!g_drawingInfo) {
        return;
    }
    g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0); // 適当に回転
    g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
    g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);

    // Calculate the normal transformation matrix and pass it to u_NormalMatrix
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

    // Calculate the model view project matrix and pass it to u_MvpMatrix
    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

    // Draw
    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}

function onReadComplete(gl, model, objDoc) {
    let drawingInfo = objDoc.getDrawingInfo();

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
    
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}

function readOBJFile(fileName, gl, model, scale, reverse) {
    let request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true);
    request.send();
}


let g_objDoc = null;
let g_drawingInfo = null;
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    let objDoc = new OBJDoc(fileName);
    let result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null;
        g_drawingInfo = null;
        console.log('OBJ file parse error.');
        return;
    }

    g_objDoc = objDoc;
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

// ------------StringParser-----------
let StringParser = function(str) {
    this.str;
    this.index;
    this.init(str);
}
StringParser.prototype.init = function(str) {
    this.str = str;
    this.index = 0;
}
StringParser.prototype.skipDelimiters = function() {
    for (let i = this.index, len = this.str.length; i < len; ++ i) {
        let c = this.str.charAt(i);
        if (c === '\t' || c === ' ' || c === '(' || c === ')' || c === '"') {
            continue;
        }
        this.index = i;
        break;
    }   
}
StringParser.prototype.skipToNextWord = function() {
    this.skipDelimiters();
    let n = getWordLength(this.str, this.index);
    this.index += (n + 1);
}
StringParser.prototype.getWord = function() {
    this.skipDelimiters();
    let n = getWordLength(this.str, this.index);
    if (n === 0) return null;
    let word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
}
StringParser.prototype.getInt = function() {
    return parseInt(this.getWord());
}
StringParser.prototype.getFloat = function() {
    return parseInt(this.getWord());
}

function getWordLength(str, start) {
    let n = 0;
    let i = start;
    for(let len = str.length; i < len; ++ i) {
        let c = str.charAt(i);
        if (c === '\t' || c === ' ' || c === '(' || c === ')' || c === '"') {
            break;
        }
    }
    return i - start;
}

// ---------- Vertex ----------
let Vertex = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

// ---------- Normal ----------
let Normal = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

// ---------- Color ----------
let Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

// ---------- Material ---------
let Material = function(name, r, g, b, a) {
    this.name = name;
    this.color = new Color(r, g, b, a);
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
let OBJObject = function(name) {
    this.name = name;
    this.faces = new Array(0);
    this.numIndices = 0;
}

OBJObject.prototype.addFace = function(face) {
    this.faces.push(face);
    this.numIndices += face.numIndices;
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
let Face = function(materialName) {
    this.materialName = materialName;
    if(materialName == null)  this.materialName = "";
    this.vIndices = new Array(0);
    this.nIndices = new Array(0);
}

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
var DrawingInfo = function(vertices, normals, colors, indices) {
    this.vertices = vertices;
    this.normals = normals;
    this.colors = colors;
    this.indices = indices;
}

// ------------ MTLDoc -----------
let MTLDoc = function() {
    this.complete = false; // MTL is configured correctly
    this.materials = new Array(0);
}

MTLDoc.prototype.parseNewmtl = function(sp) {
    return sp.getWord();         // Get name
}

MTLDoc.prototype.parseRGB = function(sp, name) {
    let r = sp.getFloat();
    let g = sp.getFloat();
    let b = sp.getFloat();
    return (new Material(name, r, g, b, 1));
}

// ---------- OBJDoc -------
let OBJDoc = function(fileName) {
    this.fileName = fileName;
    this.mtls = [];
    this.objects = [];
    this.vertices = [];
    this.normals = [];
}

OBJDoc.prototype.parse = function(fileString, scale, reverse) {
    let lines = fileString.split('\n');
    lines.push(null);
    let index = 0;

    let currentObject = null;
    let currentMaterialName = '';

    let line;
    let sp = new StringParser();
    while ((line = lines[index ++ ]) != null) {
        sp.init(line);
        let command = sp.getWord();
        if (command == null) {
            continue;
        }
        switch (command) {
            case '#':
                continue;
            case 'mtllib':
                let path = this.parseMtllib(sp, this.fileName);
                let mtl = new MTLDoc();
                this.mtls.push(mtl);
                
                let request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if (request.readyState == 4) {
                        if (request.status != 404) {
                            onReadMTLFile(request.responseText, mtl);
                        } else {
                            mtl.complete = true;
                        }
                    }
                } 
                request.open('GET', path, true);
                request.send();
                continue;
            case 'o':
                // continue;
            case 'g':
                let object = this.parseObjectName(sp);
                this.objects.push(object);
                currentObject = object;
                continue;
            case 'v':
                let vertex = this.parseVertex(sp, scale);
                this.vertices.push(vertex);
                continue;
            case 'vn':
                let normal = this.parseNormal(sp);
                this.normals.push(normal);
                continue;
            case 'usemtl':
                currentMaterialName = this.parseUsemtl(sp);
                continue;
            case 'f':
                let face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
                currentObject.addFace(face);
            default:
                break;
        }
    }

    return true;
}
OBJDoc.prototype.parseMtllib = function(sp, fileName) {
    let i = fileName.lastIndexOf('/');
    let dirPath = '';
    if (i > 0) {
        dirPath = fileName.substr(0, i + 1);
    }
    return dirPath + sp.getWord();
}
OBJDoc.prototype.parseObjectName = function(sp) {
    let name = sp.getWord();
    return (new OBJObject(name));
}
OBJDoc.prototype.parseVertex = function(sp, scale) {
    let x = sp.getFloat() * scale;
    let y = sp.getFloat() * scale;
    let z = sp.getFloat() * scale;
    return (new Vertex(x, y, z));
}
OBJDoc.prototype.parseNormal = function(sp) {
    let x = sp.getFloat();
    let y = sp.getFloat();
    let z = sp.getFloat();
    return (new Normal(x, y, z));
}
OBJDoc.prototype.parseUsemtl = function(sp) {
    return sp.getWord();
}
OBJDoc.prototype.parseFace = function(sp, materialName, vertices, reverse) {
    let face = new Face(materialName);
    for (;;) {
        let word = sp.getWord();
        if (word == null) {
            break;
        }
        let subWords = word.split('/');
        if (subWords.length >= 1) {
            let vi = parseInt(subWords[0]) - 1;
            face.vIndices.push(vi);
        }
        if (subWords.length >= 3) {
            let ni = parseInt(subWords[2]) - 1;
            face.nIndices.push(ni);
        } else {
            face.nIndices.push(-1);
        }
    }

    let v0 = [
        vertices[face.vIndices[0]].x,
        vertices[face.vIndices[0]].y,
        vertices[face.vIndices[0]].z,
    ];
    let v1 = [
        vertices[face.vIndices[1]].x,
        vertices[face.vIndices[1]].y,
        vertices[face.vIndices[1]].z
    ];
    let v2 = [
        vertices[face.vIndices[2]].x,
        vertices[face.vIndices[2]].y,
        vertices[face.vIndices[2]].z
    ];

    let normal = calcNormal(v0, v1, v2);
    if (normal == null) {
        if (face.vIndices.length >= 4) {
            let v3 = [
                vertices[face.vIndices[3]].x,
                vertices[face.vIndices[3]].y,
                vertices[face.vIndices[3]].z
            ]
            normal = calcNormal(v1, v2, v3);
        }
        if (normal == null) {
            normal = [0.0, 1.0, 0.0];
        }
    }  
    if (reverse) {
        normal[0] = -normal[0];
        normal[1] = -normal[1];
        normal[2] = -normal[2];
    }
    face.normal = new Normal(normal[0], normal[1], normal[2]);

    // Devide to triangles if face contains over 3 points.
    if(face.vIndices.length > 3){
        let n = face.vIndices.length - 2;
        let newVIndices = new Array(n * 3);
        let newNIndices = new Array(n * 3);
        for(var i = 0; i < n; ++ i){
            newVIndices[i * 3 + 0] = face.vIndices[0];
            newVIndices[i * 3 + 1] = face.vIndices[i + 1];
            newVIndices[i * 3 + 2] = face.vIndices[i + 2];
            newNIndices[i * 3 + 0] = face.nIndices[0];
            newNIndices[i * 3 + 1] = face.nIndices[i + 1];
            newNIndices[i * 3 + 2] = face.nIndices[i + 2];
        }
        face.vIndices = newVIndices;
        face.nIndices = newNIndices;
    }
    face.numIndices = face.vIndices.length;

    return face;
}

function onReadMTLFile(fileString, mtl) {
    let lines = fileString.split('\n');
    lines.push(null);
    let index = 0;

    // Parse line by line
    let line;      // A string in the line to be parsed
    let name = ""; // Material name
    let sp = new StringParser();  // Create StringParser
    while ((line = lines[index++]) != null) {
        sp.init(line);                  // init StringParser
        var command = sp.getWord();     // Get command
        if(command == null)	 continue;  // check null command

        switch(command){
            case '#':
                continue;    // Skip comments
            case 'newmtl': // Read Material chunk
                name = mtl.parseNewmtl(sp);    // Get name
                continue; // Go to the next line
            case 'Kd':   // Read normal
                if(name == "") continue; // Go to the next line because of Error
                let material = mtl.parseRGB(sp, name);
                mtl.materials.push(material);
                name = "";
                continue; // Go to the next line
        }
    }
    mtl.complete = true;
}

// Check Materials
OBJDoc.prototype.isMTLComplete = function() {
    if(this.mtls.length == 0) return true;
    for(let i = 0; i < this.mtls.length; i++){
        if(!this.mtls[i].complete) return false;
    }
    return true;
}

// Find color by material name
OBJDoc.prototype.findColor = function(name){
    for(let i = 0; i < this.mtls.length; i++){
        for(let j = 0; j < this.mtls[i].materials.length; j++){
            if(this.mtls[i].materials[j].name == name){
                return(this.mtls[i].materials[j].color)
            }
        }
    }
    return(new Color(0.8, 0.8, 0.8, 1));
}

OBJDoc.prototype.getDrawingInfo = function() {
    let numIndices = 0;
    for (let i = 0; i < this.objects.length; ++ i) {
        numIndices += this.objects[i].numIndices;
    }

    let numVertices = numIndices;
    let vertices = new Float32Array(numVertices * 3);
    let normals = new Float32Array(numVertices * 3);
    let colors = new Float32Array(numVertices * 4);
    let indices = new Uint16Array(numIndices);

    let index_indices = 0;
    for (let i = 0; i < this.objects.length; ++ i) {
        let object = this.objects[i];
        for (let j = 0; j < object.faces.length; ++ j) {
            let face = object.faces[j];
            let color = this.findColor(face.materialName);
            let faceNormal = face.normal;
            for (let k = 0; k < face.vIndices.length; ++ k) {
                indices[index_indices] = index_indices;

                let vIdx = face.vIndices[k];
                let vertex = this.vertices[vIdx];
                vertices[index_indices * 3 + 0] = vertex.x;
                vertices[index_indices * 3 + 1] = vertex.y;
                vertices[index_indices * 3 + 2] = vertex.z;

                colors[index_indices * 4 + 0] = color.r;
                colors[index_indices * 4 + 1] = color.g;
                colors[index_indices * 4 + 2] = color.b;
                colors[index_indices * 4 + 3] = color.a;

                let nIdx = face.nIndices[k];
                if (nIdx >= 0) {
                    let normal = this.normals[nIdx];
                    normals[index_indices * 3 + 0] = normal.x;
                    normals[index_indices * 3 + 1] = normal.y;
                    normals[index_indices * 3 + 2] = normal.z;
                } else {
                    normals[index_indices * 3 + 0] = faceNormal.x;
                    normals[index_indices * 3 + 1] = faceNormal.y;
                    normals[index_indices * 3 + 2] = faceNormal.z;
                }

                index_indices ++;
            }
        }
    }

    return new DrawingInfo(vertices, normals, colors, indices);
}

// ----------- Common Function -----------
function calcNormal(p0, p1, p2) {
    let v0 = new Float32Array(3);
    let v1 = new Float32Array(3);
    for (let i = 0; i < 3; ++ i) {
        v0[i] = p0[i] - p1[i];
        v1[i] = p2[i] - p1[i];
    }

    let c = new Float32Array(3);
    c[0] = v0[1] * v1[2] - v0[2] * v1[1];
    c[1] = v0[2] * v1[0] - v0[0] * v1[2];
    c[2] = v0[0] * v1[1] - v0[1] * v1[0];

    let v = new Vector3(c);
    v.normalize();
    return v.elements;
}