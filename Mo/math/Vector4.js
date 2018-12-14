
function Vector4(x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = (w !== undefined) ? w : 1;
}

Object.assign(Vector4.prototype, {
    isVector4: true,
    set: function(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    },
    add: function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    },
    addScalar: function(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        this.w += s;
        return this;
    },
    sub: function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    },
    subScalar: function(s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;
        this.w -= s;
        return this;
    },
    multiplyScalar: function(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        this.w *= s;
        return this;
    },
    divideScalar: function(s) {
        return this.multiplyScalar( 1 / s );
    },

    dot: function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    },
    

    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    },
    normalize: function() {
        return this.divideScalar(this.length() || 1);
    }
});

export {Vector4};

