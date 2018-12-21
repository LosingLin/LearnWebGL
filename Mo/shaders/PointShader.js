
let VShader_Point = `
attribute vec4  a_Position;

uniform float u_PointSize;

void main() {
    gl_Position = a_Position;
    gl_PointSize = u_PointSize;
}
`;

let FShader_Point = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 u_Color;

void main() {
    gl_FragColor = u_Color;
}
`;

export {VShader_Point, FShader_Point};