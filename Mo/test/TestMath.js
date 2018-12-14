import {Vector2} from '../math/Vector2.js';
import {Vector3} from '../math/Vector3.js';
import {Matrix3} from '../math/Matrix3.js';
import {Matrix4} from '../math/Matrix4.js';

// let Vector2 = require('../math/Vector2');

// import * from '../math/Vector2';

import {GLHelper} from '../gl/GLHelper.js';

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
    
}

window.main = main;