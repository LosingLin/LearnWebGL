
let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
    }
`;

let FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main () {
        gl_FragColor = u_FragColor;
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

    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

    let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    gl.vertexAttrib1f(a_PointSize, 20.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function(event) {
        clicked(event, gl, a_Position, u_FragColor);
    }

    
    // gl.vertexAttrib3f(a_Position, -0.5, -0.5, 0.0);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);
}


let a_Points = [];
let u_Colors = [];
function clicked(event, gl, a_Position, u_FragColor) {
    // console.log('-- event : ', event);

    let x = event.clientX;
    let y = event.clientY;
    let canvas = event.target;
    let rect = canvas.getBoundingClientRect();
    x = (x - rect.left - canvas.height/2) / (canvas.height/2)
    y = (canvas.width/2 - (y - rect.top)) / (canvas.width/2)

    a_Points.push([x, y]);
    if (x >= 0.0 && y >= 0.0) {
        u_Colors.push([1.0, 0.0, 0.0, 1.0])
    } else if (x < 0.0 && y < 0.0) {
        u_Colors.push([0.0, 1.0, 0.0, 0.5]);
    } else {
        u_Colors.push([1.0, 1.0, 1.0, 0.5]);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    let len = a_Points.length;
    for (let i = 0; i < len; ++ i) {
        gl.vertexAttrib3f(a_Position, a_Points[i][0], a_Points[i][1], 0.0);
        gl.uniform4f(u_FragColor, u_Colors[i][0], u_Colors[i][1], u_Colors[i][2], u_Colors[i][3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
    
}

