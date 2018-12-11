
function Vector3( x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Object.assign( Vector3.prototype, {
    isVector3: true,
    set: function( x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    },
    add: function( v ) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    },
    addScalar: function( s ) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    },
    sub: function( v ) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    },
    subScalar: function( s ) {
        this.x -= s;
        this.y -= y;
        this.z -= z;
        return this;
    },
    multiply: function( v ) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    },
    multiplyScalar: function( s ) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    },
    divide: function( v ) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    },
    divideScalar: function( s ) {
        this.x /= s;
        this.y /= s;
        this.z /= s;
        return this;
    },

    dot: function ( v ) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    },
    cross: function ( v ) {
        let x = this.y * v.z - this.z * v.y;
        let y = this.z * v.x - this.x * v.z;
        let z = this.x * v.y - this.y * v.x;

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    },

    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },
    normalize: function () {
        return this.divideScalar(this.length() || 1);
    } 
} );

export { Vector3 };