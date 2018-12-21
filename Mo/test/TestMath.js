import {Vector2} from '../math/Vector2.js';
import {Vector3} from '../math/Vector3.js';
import {Vector4} from '../math/Vector4.js';
import {Matrix3} from '../math/Matrix3.js';
import {Matrix4} from '../math/Matrix4.js';

// let Vector2 = require('../math/Vector2');

// import * from '../math/Vector2';

import {GLHelper} from '../gl/GLHelper.js';

import {VShader_Point, FShader_Point} from '../shaders/PointShader.js'

window.gl = null;

function main () {

    let vec2 = new Vector2();

    console.log('--- vec2 : ', vec2);

    let vec3 = new Vector3();
    console.log('--- vec3 :', vec3);

    let dotVec3_1 = new Vector3(0, 1, 0);
    let dotVec3_2 = new Vector3(1, 2, 0).normalize();
    console.log('----- dotVec3_2 : ', dotVec3_2);

    console.log('----- dot : ', dotVec3_1.dot(dotVec3_2));

    console.log('----- cross : ', dotVec3_1.cross(dotVec3_2).normalize());

    let mat3 = new Matrix3().set(1, 1, 1, 2, 2, 2, 3, 3, 3);
    let mat3_2 = mat3.clone();
    mat3.identity();
    console.log('------ mat3', mat3);
    console.log('------ mat3_2', mat3_2);

    let mat4 = new Matrix4().set(1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4);
    let mat4_2 = mat4.clone();
    mat4.identity();
    console.log('----mat4: ', mat4);
    console.log('----mat4_2', mat4_2);
    

    let glHelper = new GLHelper();
    glHelper.initGLContext('webgl');
    window.gl = glHelper.glContext;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const program = glHelper.initShaderProgram(VShader_Point, FShader_Point);
    let a_Position = gl.getAttribLocation(program, 'a_Position');
    let u_PointSize = gl.getUniformLocation(program, 'u_PointSize');
    let u_Color = gl.getUniformLocation(program, 'u_Color');

    console.log('---- a_Position : ', a_Position);
    console.log('---- u_PointSize : ', u_PointSize);

    gl.useProgram(program);

    let point = new Vector3(0.0, 0.0, 0.0);
    gl.vertexAttrib3f(a_Position, point.x, point.y, point.z);
    gl.uniform1f(u_PointSize, 20.0);

    let color = new Vector4(1.0, 1.0, 0.0, 0.6);
    gl.uniform4f(u_Color, color.x, color.y, color.z, color.w);

    gl.drawArrays(gl.POINTS, 0, 1);

    point.set(0.2, 0.2, 0.0);
    gl.vertexAttrib3f(a_Position, point.x, point.y, point.z);
    gl.drawArrays(gl.POINTS, 0, 1);

}

window.main = main;