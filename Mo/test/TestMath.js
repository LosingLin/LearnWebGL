import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix3 } from '../math/Matrix3.js';

// let Vector2 = require('../math/Vector2');

// import * from '../math/Vector2';

function main () {

    let vec2 = new Vector2();

    console.log( '--- vec2 : ', vec2 );

    let vec3 = new Vector3();
    console.log( '--- vec3 : ', vec3);

    let dotVec3_1 = new Vector3(0, 1, 0);
    let dotVec3_2 = new Vector3(1, 2, 0).normalize();
    console.log( '----- dotVec3_2 : ', dotVec3_2);

    console.log( '----- dot : ', dotVec3_1.dot(dotVec3_2));

    console.log( '----- cross : ', dotVec3_1.cross(dotVec3_2).normalize());

    let mat3 = new Matrix3().set( 1, 1, 1, 2, 2, 2, 3, 3, 3);
    let mat3_2 = mat3.clone();
    mat3.identity();
    console.log( '------ mat3 ', mat3);
    console.log( '------ mat3_2 ', mat3_2);
}

window.main = main;